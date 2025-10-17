# Django Views - Complete Cheatsheet

## Table of Contents
1. [What are Views?](#what-are-views)
2. [Function-Based Views](#function-based-views)
3. [Class-Based Views](#class-based-views)
4. [Generic Views](#generic-views)
5. [Request & Response](#request--response)
6. [HTTP Methods](#http-methods)
7. [Decorators](#decorators)
8. [Mixins](#mixins)
9. [REST Framework Views](#rest-framework-views)
10. [Best Practices](#best-practices)

---

## What are Views?

**Views handle web requests and return web responses.**

### The Request/Response Cycle

```
User → Browser → URL → Django → View → Response → Browser → User
```

**Example Flow:**
1. User visits: `https://example.com/products/iphone-15/`
2. Django matches URL pattern: `products/<slug:slug>/`
3. Calls view: `product_detail(request, slug='iphone-15')`
4. View queries database, processes data
5. View returns: Template (HTML), JSON, Redirect, or File
6. Browser displays response

### What Views Do

**Views are responsible for:**
- ✅ Accepting HTTP requests (GET, POST, PUT, DELETE, etc.)
- ✅ Processing URL parameters and query strings
- ✅ Validating and processing form data
- ✅ Querying the database
- ✅ Applying business logic
- ✅ Rendering templates or returning data
- ✅ Handling authentication and permissions
- ✅ Managing redirects and errors

### Two Types of Views

```python
# Function-Based View (FBV)
def product_list(request):
    products = Product.objects.all()
    return render(request, 'products/list.html', {'products': products})

# Class-Based View (CBV)
class ProductListView(ListView):
    model = Product
    template_name = 'products/list.html'
```

**When to use which?**
- **FBV**: Simple views, custom logic, easier to understand
- **CBV**: Complex CRUD operations, code reusability, built-in features

---

## Function-Based Views

**Simple Python functions that take a request and return a response.**

### Basic Structure

```python
from django.shortcuts import render
from django.http import HttpResponse

def my_view(request):
    """
    Args:
        request (HttpRequest): Contains all request data
    
    Returns:
        HttpResponse: Response to send to browser
    """
    # Your logic here
    return HttpResponse("Hello, World!")
```

### Simple Text Response

```python
from django.http import HttpResponse

def hello_world(request):
    """Return plain text"""
    return HttpResponse("Hello, World!")

def hello_html(request):
    """Return HTML"""
    html = "<h1>Hello</h1><p>Welcome to Django</p>"
    return HttpResponse(html)
```

### Rendering Templates

```python
from django.shortcuts import render
from .models import Product

def product_list(request):
    """Display all products"""
    products = Product.objects.all()
    
    context = {
        'products': products,
        'total_count': products.count(),
        'page_title': 'All Products'
    }
    
    return render(request, 'products/list.html', context)
```

### URL Parameters

```python
from django.shortcuts import render, get_object_or_404

# Single parameter
def product_detail(request, slug):
    """Display single product by slug"""
    product = get_object_or_404(Product, slug=slug)
    
    return render(request, 'products/detail.html', {
        'product': product
    })

# Multiple parameters
def category_product(request, category_slug, product_slug):
    """Product within specific category"""
    category = get_object_or_404(Category, slug=category_slug)
    product = get_object_or_404(
        Product,
        slug=product_slug,
        category=category
    )
    
    return render(request, 'products/detail.html', {
        'product': product,
        'category': category
    })
```

### Query Parameters (GET Parameters)

```python
def product_search(request):
    """Search and filter products"""
    products = Product.objects.all()
    
    # Get query parameters from ?search=laptop&category=1
    search_query = request.GET.get('search', '')
    category_id = request.GET.get('category', '')
    min_price = request.GET.get('min_price', '')
    
    # Apply filters
    if search_query:
        products = products.filter(name__icontains=search_query)
    
    if category_id:
        products = products.filter(category_id=category_id)
    
    if min_price:
        products = products.filter(price__gte=min_price)
    
    context = {
        'products': products,
        'search_query': search_query,
        'categories': Category.objects.all()
    }
    
    return render(request, 'products/search.html', context)
```

### Handling Forms (POST)

```python
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import ProductForm

def create_product(request):
    """Create new product"""
    if request.method == 'POST':
        # Form was submitted
        form = ProductForm(request.POST, request.FILES)
        
        if form.is_valid():
            # Save the product
            product = form.save(commit=False)
            product.created_by = request.user
            product.save()
            form.save_m2m()  # Save many-to-many relationships
            
            # Success message
            messages.success(request, 'Product created successfully!')
            
            # Redirect to prevent duplicate submission on refresh
            return redirect('product_detail', slug=product.slug)
        else:
            # Form has errors
            messages.error(request, 'Please correct the errors below.')
    else:
        # GET request: Show empty form
        form = ProductForm()
    
    return render(request, 'products/form.html', {'form': form})

def edit_product(request, slug):
    """Edit existing product"""
    product = get_object_or_404(Product, slug=slug)
    
    if request.method == 'POST':
        # Populate form with POST data and existing instance
        form = ProductForm(request.POST, request.FILES, instance=product)
        
        if form.is_valid():
            form.save()
            messages.success(request, 'Product updated successfully!')
            return redirect('product_detail', slug=product.slug)
    else:
        # GET request: Pre-populate form with existing data
        form = ProductForm(instance=product)
    
    return render(request, 'products/form.html', {
        'form': form,
        'product': product
    })

def delete_product(request, slug):
    """Delete product"""
    product = get_object_or_404(Product, slug=slug)
    
    if request.method == 'POST':
        product.delete()
        messages.success(request, 'Product deleted successfully!')
        return redirect('product_list')
    
    # GET request: Show confirmation page
    return render(request, 'products/confirm_delete.html', {
        'product': product
    })
```

### JSON Responses

```python
from django.http import JsonResponse

def product_api(request):
    """Return products as JSON"""
    products = Product.objects.values('id', 'name', 'price', 'stock')
    
    # Convert to list for JSON serialization
    return JsonResponse(list(products), safe=False)

def product_detail_api(request, product_id):
    """Return single product as JSON"""
    product = get_object_or_404(Product, id=product_id)
    
    data = {
        'id': product.id,
        'name': product.name,
        'price': str(product.price),
        'stock': product.stock,
        'category': product.category.name
    }
    
    return JsonResponse(data)

def product_stats(request):
    """Return statistics as JSON"""
    from django.db.models import Count, Avg
    
    stats = {
        'total_products': Product.objects.count(),
        'active_products': Product.objects.filter(is_active=True).count(),
        'average_price': float(Product.objects.aggregate(Avg('price'))['price__avg'] or 0),
        'categories': list(
            Category.objects.annotate(
                product_count=Count('products')
            ).values('name', 'product_count')
        )
    }
    
    return JsonResponse(stats)
```

### AJAX Handling

```python
from django.http import JsonResponse
from django.views.decorators.http import require_POST

@require_POST
def add_to_cart(request, product_id):
    """AJAX endpoint to add product to cart"""
    # Check if it's an AJAX request
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if not is_ajax:
        return JsonResponse({'error': 'AJAX request required'}, status=400)
    
    try:
        product = Product.objects.get(id=product_id)
        quantity = int(request.POST.get('quantity', 1))
        
        # Add to session cart
        cart = request.session.get('cart', {})
        cart[str(product_id)] = cart.get(str(product_id), 0) + quantity
        request.session['cart'] = cart
        request.session.modified = True
        
        return JsonResponse({
            'success': True,
            'message': 'Product added to cart',
            'cart_count': sum(cart.values()),
            'product_name': product.name
        })
    
    except Product.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Product not found'
        }, status=404)
    
    except ValueError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid quantity'
        }, status=400)
```

### File Downloads

```python
from django.http import FileResponse, HttpResponse
import os

def download_file(request, file_id):
    """Download a file"""
    document = get_object_or_404(Document, id=file_id)
    
    # Check permissions
    if not request.user.is_authenticated:
        return HttpResponse('Login required', status=401)
    
    file_path = document.file.path
    
    if os.path.exists(file_path):
        response = FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=document.filename
        )
        return response
    else:
        raise Http404("File not found")

def export_csv(request):
    """Generate and download CSV"""
    import csv
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="products.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['ID', 'Name', 'Price', 'Stock'])
    
    for product in Product.objects.all():
        writer.writerow([
            product.id,
            product.name,
            product.price,
            product.stock
        ])
    
    return response
```

### Pagination

```python
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def product_list_paginated(request):
    """Product list with pagination"""
    product_list = Product.objects.all().order_by('-created_at')
    
    # Create paginator (25 items per page)
    paginator = Paginator(product_list, 25)
    
    # Get page number from query string (?page=2)
    page_number = request.GET.get('page', 1)
    
    try:
        products = paginator.page(page_number)
    except PageNotAnInteger:
        # If page is not an integer, show first page
        products = paginator.page(1)
    except EmptyPage:
        # If page is out of range, show last page
        products = paginator.page(paginator.num_pages)
    
    return render(request, 'products/list.html', {
        'page_obj': products,
        'is_paginated': products.has_other_pages()
    })

# In template:
"""
{% for product in page_obj %}
    <div>{{ product.name }}</div>
{% endfor %}

<!-- Pagination controls -->
<div class="pagination">
    {% if page_obj.has_previous %}
        <a href="?page={{ page_obj.previous_page_number }}">Previous</a>
    {% endif %}
    
    <span>Page {{ page_obj.number }} of {{ page_obj.paginator.num_pages }}</span>
    
    {% if page_obj.has_next %}
        <a href="?page={{ page_obj.next_page_number }}">Next</a>
    {% endif %}
</div>
"""
```

### Redirects

```python
from django.shortcuts import redirect
from django.http import HttpResponseRedirect, HttpResponsePermanentRedirect

def simple_redirect(request):
    """Redirect to another URL"""
    return redirect('product_list')

def redirect_with_params(request):
    """Redirect with URL parameters"""
    return redirect('product_detail', slug='iphone-15')

def redirect_to_url(request):
    """Redirect to absolute URL"""
    return redirect('/products/')

def permanent_redirect(request):
    """Permanent redirect (301)"""
    return redirect('new_url', permanent=True)

def old_product_view(request, product_id):
    """Redirect old URL to new URL"""
    product = get_object_or_404(Product, id=product_id)
    return redirect('product_detail', slug=product.slug)
```

---

## Class-Based Views

**Views as classes with methods for different HTTP methods.**

### Why Use Class-Based Views?

**Advantages:**
- ✅ Code reusability through inheritance
- ✅ Built-in generic views for common patterns
- ✅ Better organization for complex views
- ✅ Mixins for shared functionality
- ✅ Less boilerplate code

**Disadvantages:**
- ❌ Steeper learning curve
- ❌ Harder to debug
- ❌ More implicit behavior

### Basic Structure

```python
from django.views import View
from django.shortcuts import render
from django.http import HttpResponse

class MyView(View):
    """Basic class-based view"""
    
    def get(self, request, *args, **kwargs):
        """Handle GET requests"""
        return HttpResponse("This is a GET request")
    
    def post(self, request, *args, **kwargs):
        """Handle POST requests"""
        return HttpResponse("This is a POST request")

# In urls.py
from django.urls import path
from .views import MyView

urlpatterns = [
    path('my-view/', MyView.as_view(), name='my_view'),
]
```

### TemplateView

**Simple view that renders a template.**

```python
from django.views.generic import TemplateView

class HomeView(TemplateView):
    """Render home page"""
    template_name = 'home.html'
    
    def get_context_data(self, **kwargs):
        """Add extra context to template"""
        context = super().get_context_data(**kwargs)
        context['featured_products'] = Product.objects.filter(
            is_featured=True
        )[:6]
        context['total_products'] = Product.objects.count()
        context['categories'] = Category.objects.all()
        return context
```

### Handling Forms in CBV

```python
from django.views import View
from django.shortcuts import render, redirect
from django.contrib import messages

class ContactView(View):
    """Contact form view"""
    template_name = 'contact.html'
    form_class = ContactForm
    
    def get(self, request):
        """Show form"""
        form = self.form_class()
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        """Process form"""
        form = self.form_class(request.POST)
        
        if form.is_valid():
            # Process form data
            form.send_email()
            messages.success(request, 'Message sent successfully!')
            return redirect('home')
        
        return render(request, self.template_name, {'form': form})
```

### Class Attributes

```python
class ProductListView(View):
    """View with class attributes"""
    template_name = 'products/list.html'
    context_object_name = 'products'
    paginate_by = 25
    
    def get(self, request):
        products = Product.objects.all()
        
        # Access class attributes
        context = {
            self.context_object_name: products
        }
        
        return render(request, self.template_name, context)
```

---

## Generic Views

**Pre-built views for common patterns.**

### ListView

**Display a list of objects with optional pagination.**

```python
from django.views.generic import ListView

class ProductListView(ListView):
    """Display all products"""
    model = Product
    template_name = 'products/list.html'
    context_object_name = 'products'
    paginate_by = 25
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Customize the queryset"""
        queryset = super().get_queryset()
        
        # Optimize queries
        queryset = queryset.select_related('category')
        queryset = queryset.prefetch_related('tags')
        
        # Filter by query parameters
        search = self.request.GET.get('q')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        return queryset
    
    def get_context_data(self, **kwargs):
        """Add extra context"""
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        context['search_query'] = self.request.GET.get('q', '')
        context['total_count'] = self.get_queryset().count()
        return context
```

### DetailView

**Display a single object.**

```python
from django.views.generic import DetailView

class ProductDetailView(DetailView):
    """Display single product"""
    model = Product
    template_name = 'products/detail.html'
    context_object_name = 'product'
    
    # Use slug instead of pk
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    
    def get_queryset(self):
        """Optimize query"""
        return super().get_queryset().select_related(
            'category',
            'created_by'
        ).prefetch_related('tags')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add related products
        context['related_products'] = Product.objects.filter(
            category=self.object.category
        ).exclude(id=self.object.id)[:4]
        
        # Add reviews
        context['reviews'] = self.object.reviews.filter(
            is_approved=True
        )[:10]
        
        return context

# URL pattern
# path('products/<slug:slug>/', ProductDetailView.as_view(), name='product_detail')
```

### CreateView

**Form to create a new object.**

```python
from django.views.generic import CreateView
from django.urls import reverse_lazy
from django.contrib import messages

class ProductCreateView(CreateView):
    """Create new product"""
    model = Product
    form_class = ProductForm
    template_name = 'products/form.html'
    success_url = reverse_lazy('product_list')
    
    def form_valid(self, form):
        """Called when form is valid"""
        # Add extra data before saving
        form.instance.created_by = self.request.user
        
        # Add success message
        messages.success(self.request, 'Product created successfully!')
        
        return super().form_valid(form)
    
    def form_invalid(self, form):
        """Called when form is invalid"""
        messages.error(self.request, 'Please correct the errors below.')
        return super().form_invalid(form)
    
    def get_success_url(self):
        """Dynamic redirect URL"""
        # Redirect to the created object
        return reverse_lazy('product_detail', kwargs={'slug': self.object.slug})

# Alternative: Use fields instead of form_class
class ProductCreateView(CreateView):
    model = Product
    fields = ['name', 'slug', 'description', 'price', 'stock', 'category']
    template_name = 'products/form.html'
    success_url = reverse_lazy('product_list')
```

### UpdateView

**Form to edit an existing object.**

```python
from django.views.generic import UpdateView

class ProductUpdateView(UpdateView):
    """Edit existing product"""
    model = Product
    form_class = ProductForm
    template_name = 'products/form.html'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    
    def get_success_url(self):
        messages.success(self.request, 'Product updated successfully!')
        return reverse_lazy('product_detail', kwargs={'slug': self.object.slug})
    
    def form_valid(self, form):
        # Update audit fields
        form.instance.updated_by = self.request.user
        return super().form_valid(form)

# URL pattern
# path('products/<slug:slug>/edit/', ProductUpdateView.as_view(), name='product_update')
```

### DeleteView

**Confirm and delete an object.**

```python
from django.views.generic import DeleteView

class ProductDeleteView(DeleteView):
    """Delete product"""
    model = Product
    template_name = 'products/confirm_delete.html'
    success_url = reverse_lazy('product_list')
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    
    def delete(self, request, *args, **kwargs):
        """Override to add message"""
        messages.success(request, f'{self.get_object().name} deleted successfully!')
        return super().delete(request, *args, **kwargs)

# In template: products/confirm_delete.html
"""
<h2>Delete {{ object.name }}?</h2>
<p>Are you sure you want to delete this product? This action cannot be undone.</p>

<form method="post">
    {% csrf_token %}
    <button type="submit" class="btn btn-danger">Yes, Delete</button>
    <a href="{% url 'product_detail' object.slug %}" class="btn btn-secondary">Cancel</a>
</form>
"""
```

### FormView

**Display and process a form (not tied to a model).**

```python
from django.views.generic import FormView

class ContactFormView(FormView):
    """Contact form"""
    template_name = 'contact.html'
    form_class = ContactForm
    success_url = reverse_lazy('home')
    
    def form_valid(self, form):
        """Process form data"""
        # Send email
        name = form.cleaned_data['name']
        email = form.cleaned_data['email']
        message = form.cleaned_data['message']
        
        form.send_email()
        
        messages.success(self.request, 'Thank you! We will contact you soon.')
        return super().form_valid(form)
    
    def get_initial(self):
        """Pre-populate form"""
        initial = super().get_initial()
        if self.request.user.is_authenticated:
            initial['email'] = self.request.user.email
            initial['name'] = self.request.user.get_full_name()
        return initial
```

### RedirectView

**Redirect to another URL.**

```python
from django.views.generic import RedirectView

class OldProductRedirect(RedirectView):
    """Redirect old URL to new URL"""
    permanent = True  # 301 redirect (permanent)
    pattern_name = 'product_detail'
    
    def get_redirect_url(self, *args, **kwargs):
        # Convert old product ID to slug
        product = get_object_or_404(Product, pk=kwargs['pk'])
        kwargs['slug'] = product.slug
        del kwargs['pk']
        return super().get_redirect_url(*args, **kwargs)

# URL patterns
# path('old/products/<int:pk>/', OldProductRedirect.as_view()),  # Old URL
# path('products/<slug:slug>/', ProductDetailView.as_view(), name='product_detail'),  # New URL
```

---

## Request & Response

### HttpRequest Object

**The `request` object contains all information about the HTTP request.**

```python
def my_view(request):
    # HTTP Method
    request.method  # 'GET', 'POST', 'PUT', 'DELETE', etc.
    
    # GET parameters (?key=value&key2=value2)
    search = request.GET.get('search')  # Single value
    page = request.GET.get('page', 1)  # With default
    tags = request.GET.getlist('tags')  # Multiple values: ?tags=1&tags=2
    
    # POST data (from forms)
    username = request.POST.get('username')
    password = request.POST.get('password')
    
    # FILES (uploaded files)
    avatar = request.FILES.get('avatar')
    documents = request.FILES.getlist('documents')
    
    # Headers
    user_agent = request.headers.get('User-Agent')
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    content_type = request.headers.get('Content-Type')
    
    # User information
    request.user  # Current user (AnonymousUser if not logged in)
    request.user.is_authenticated  # Boolean
    request.user.is_staff  # Boolean
    request.user.username  # Username
    
    # Session (server-side storage)
    request.session['cart'] = {}
    cart = request.session.get('cart', {})
    request.session.modified = True  # Mark session as changed
    
    # Cookies (client-side storage)
    session_id = request.COOKIES.get('sessionid')
    
    # Path information
    request.path  # '/products/list/'
    request.get_full_path()  # '/products/list/?page=2'
    request.build_absolute_uri()  # 'https://example.com/products/list/?page=2'
    
    # Request metadata
    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT')
    
    # Request body (for PUT/PATCH/DELETE)
    raw_body = request.body  # Raw bytes
    
    # JSON body parsing
    import json
    if request.content_type == 'application/json':
        data = json.loads(request.body)
    
    return HttpResponse("OK")
```

### HttpResponse Objects

**Different types of responses you can return.**

```python
from django.http import (
    HttpResponse,
    JsonResponse,
    HttpResponseRedirect,
    HttpResponsePermanentRedirect,
    HttpResponseBadRequest,
    HttpResponseNotFound,
    HttpResponseForbidden,
    FileResponse,
    StreamingHttpResponse
)
from django.shortcuts import render, redirect

# 1. Plain text response
def text_response(request):
    return HttpResponse("Hello, World!")

# 2. HTML response
def html_response(request):
    html = "<h1>Hello</h1><p>Welcome to Django</p>"
    return HttpResponse(html, content_type='text/html')

# 3. JSON response
def json_response(request):
    data = {
        'name': 'Product',
        'price': 99.99,
        'in_stock': True
    }
    return JsonResponse(data)

# 4. JSON list (requires safe=False)
def json_list(request):
    products = list(Product.objects.values('id', 'name', 'price'))
    return JsonResponse(products, safe=False)

# 5. Render template
def template_response(request):
    context = {'name': 'John'}
    return render(request, 'template.html', context)

# 6. Redirect
def redirect_view(request):
    return redirect('product_list')
    # Or absolute URL
    # return redirect('/products/')

# 7. Permanent redirect (301)
def permanent_redirect_view(request):
    return redirect('new_url', permanent=True)

# 8. Custom status codes
def not_found(request):
    return HttpResponse('Not Found', status=404)

def bad_request(request):
    return HttpResponseBadRequest('Bad Request')

def forbidden(request):
    return HttpResponseForbidden('Forbidden')

# 9. Response with custom headers
def custom_headers(request):
    response = HttpResponse("Content")
    response['X-Custom-Header'] = 'Value'
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response

# 10. Set cookies
def set_cookie_view(request):
    response = HttpResponse("Cookie set")
    response.set_cookie(
        key='user_pref',
        value='dark_mode',
        max_age=3600,  # 1 hour in seconds
        secure=True,   # HTTPS only
        httponly=True, # Not accessible via JavaScript
        samesite='Lax' # CSRF protection
    )
    return response

# 11. Delete cookie
def delete_cookie_view(request):
    response = HttpResponse("Cookie deleted")
    response.delete_cookie('user_pref')
    return response

# 12. File download
def download_file(request):
    file_path = '/path/to/file.pdf'
    return FileResponse(
        open(file_path, 'rb'),
        as_attachment=True,
        filename='document.pdf'
    )

# 13. CSV export
import csv
def export_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="products.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Name', 'Price', 'Stock'])
    
    for product in Product.objects.all():
        writer.writerow([product.name, product.price, product.stock])
    
    return response

# 14. Streaming response (large files)
def stream_large_file(request):
    def file_iterator(file_path, chunk_size=8192):
        with open(file_path, 'rb') as f:
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                yield chunk
    
    response = StreamingHttpResponse(
        file_iterator('/path/to/large_file.zip'),
        content_type='application/zip'
    )
    response['Content-Disposition'] = 'attachment; filename="file.zip"'
    return response
```

---

## HTTP Methods

**Handle different HTTP methods in views.**

### GET - Retrieve Data

```python
# Function-based view
def product_list(request):
    if request.method == 'GET':
        products = Product.objects.all()
        return render(request, 'products/list.html', {'products': products})

# Class-based view
class ProductListView(View):
    def get(self, request):
        products = Product.objects.all()
        return render(request, 'products/list.html', {'products': products})
```

### POST - Create/Submit Data

```python
# Function-based view
def create_product(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save()
            return redirect('product_detail', slug=product.slug)
    else:
        form = ProductForm()
    
    return render(request, 'products/form.html', {'form': form})

# Class-based view
class ProductCreateView(View):
    def get(self, request):
        form = ProductForm()
        return render(request, 'products/form.html', {'form': form})
    
    def post(self, request):
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save()
            return redirect('product_detail', slug=product.slug)
        return render(request, 'products/form.html', {'form': form})
```

### PUT - Full Update (REST APIs)

```python
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # For API (use proper auth instead)
def update_product(request, product_id):
    if request.method == 'PUT':
        product = get_object_or_404(Product, id=product_id)
        data = json.loads(request.body)
        
        # Update all fields
        product.name = data.get('name')
        product.price = data.get('price')
        product.stock = data.get('stock')
        product.save()
        
        return JsonResponse({
            'id': product.id,
            'name': product.name,
            'price': str(product.price)
        })
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
```

### PATCH - Partial Update (REST APIs)

```python
@csrf_exempt
def partial_update_product(request, product_id):
    if request.method == 'PATCH':
        product = get_object_or_404(Product, id=product_id)
        data = json.loads(request.body)
        
        # Update only provided fields
        if 'name' in data:
            product.name = data['name']
        if 'price' in data:
            product.price = data['price']
        if 'stock' in data:
            product.stock = data['stock']
        
        product.save()
        
        return JsonResponse({'status': 'updated', 'id': product.id})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
```

### DELETE - Delete Resource

```python
@csrf_exempt
def delete_product(request, product_id):
    if request.method == 'DELETE':
        product = get_object_or_404(Product, id=product_id)
        product_name = product.name
        product.delete()
        
        return JsonResponse({
            'status': 'deleted',
            'name': product_name
        })
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
```

### All Methods in One View

```python
class ProductAPIView(View):
    """RESTful API endpoint"""
    
    def get(self, request, product_id):
        """Retrieve product"""
        product = get_object_or_404(Product, id=product_id)
        return JsonResponse({
            'id': product.id,
            'name': product.name,
            'price': str(product.price),
            'stock': product.stock
        })
    
    def put(self, request, product_id):
        """Full update"""
        product = get_object_or_404(Product, id=product_id)
        data = json.loads(request.body)
        
        product.name = data['name']
        product.price = data['price']
        product.stock = data['stock']
        product.save()
        
        return JsonResponse({'status': 'updated'})
    
    def patch(self, request, product_id):
        """Partial update"""
        product = get_object_or_404(Product, id=product_id)
        data = json.loads(request.body)
        
        for field, value in data.items():
            if hasattr(product, field):
                setattr(product, field, value)
        
        product.save()
        
        return JsonResponse({'status': 'updated'})
    
    def delete(self, request, product_id):
        """Delete product"""
        product = get_object_or_404(Product, id=product_id)
        product.delete()
        
        return JsonResponse({'status': 'deleted'}, status=204)
```

---

## Decorators

**Modify view behavior without changing the view code.**

### Authentication Decorators

```python
from django.contrib.auth.decorators import login_required, permission_required, user_passes_test

# Require login
@login_required
def dashboard(request):
    """User must be logged in"""
    return render(request, 'dashboard.html')

# With custom login URL
@login_required(login_url='/accounts/login/')
def profile(request):
    return render(request, 'profile.html')

# Require specific permission
@permission_required('products.add_product')
def create_product(request):
    """User must have 'add_product' permission"""
    pass

# Require multiple permissions
@permission_required(['products.add_product', 'products.change_product'])
def manage_products(request):
    """User must have both permissions"""
    pass

# Custom user test
def is_premium_member(user):
    return user.is_authenticated and hasattr(user, 'profile') and user.profile.is_premium

@user_passes_test(is_premium_member, login_url='/subscribe/')
def premium_content(request):
    """Only premium members can access"""
    pass
```

### HTTP Method Decorators

```python
from django.views.decorators.http import require_http_methods, require_GET, require_POST, require_safe

# Allow only GET
@require_GET
def product_list(request):
    pass

# Allow only POST
@require_POST
def create_product(request):
    pass

# Allow GET and HEAD (safe methods)
@require_safe
def read_only_view(request):
    pass

# Allow specific methods
@require_http_methods(["GET", "POST", "PUT"])
def flexible_view(request):
    if request.method == 'GET':
        pass
    elif request.method == 'POST':
        pass
    elif request.method == 'PUT':
        pass
```

### Cache Decorators

```python
from django.views.decorators.cache import cache_page, never_cache
from django.views.decorators.vary import vary_on_cookie

# Cache view for 15 minutes
@cache_page(60 * 15)
def product_list(request):
    """Results cached for 15 minutes"""
    products = Product.objects.all()
    return render(request, 'products/list.html', {'products': products})

# Cache per-user (different cache for each logged-in user)
@cache_page(60 * 15)
@vary_on_cookie
def user_dashboard(request):
    """Each user gets their own cached version"""
    pass

# Never cache
@never_cache
def dynamic_content(request):
    """Always fresh data"""
    pass
```

### CSRF Decorators

```python
from django.views.decorators.csrf import csrf_exempt, csrf_protect

# Exempt from CSRF (use carefully - mainly for APIs)
@csrf_exempt
def webhook(request):
    """External webhooks don't have CSRF token"""
    pass

# Ensure CSRF protection
@csrf_protect
def important_form(request):
    """Explicitly enforce CSRF"""
    pass
```

### Custom Decorators

```python
from functools import wraps
from django.http import HttpResponseForbidden, JsonResponse

# Check if user owns resource
def user_owns_object(view_func):
    """Ensure user owns the object being modified"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        product_id = kwargs.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        
        if product.created_by != request.user:
            return HttpResponseForbidden("You don't own this resource")
        
        return view_func(request, *args, **kwargs)
    return wrapper

@login_required
@user_owns_object
def edit_my_product(request, product_id):
    """User can only edit their own products"""
    pass

# AJAX required decorator
def ajax_required(view_func):
    """Only allow AJAX requests"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'AJAX required'}, status=400)
        return view_func(request, *args, **kwargs)
    return wrapper

@ajax_required
def ajax_endpoint(request):
    return JsonResponse({'status': 'ok'})

# Rate limiting decorator
from django.core.cache import cache

def rate_limit(max_requests=10, period=60):
    """Simple rate limiting using cache"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Create identifier
            if request.user.is_authenticated:
                identifier = f'rate_limit_{request.user.id}'
            else:
                identifier = f'rate_limit_{request.META.get("REMOTE_ADDR")}'
            
            # Check current count
            count = cache.get(identifier, 0)
            
            if count >= max_requests:
                return JsonResponse({
                    'error': 'Rate limit exceeded. Try again later.'
                }, status=429)
            
            # Increment counter
            cache.set(identifier, count + 1, period)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

@rate_limit(max_requests=5, period=60)
def api_endpoint(request):
    """Limited to 5 requests per minute"""
    pass
```

### Combining Decorators

```python
# Multiple decorators (applied bottom to top)
@login_required
@require_POST
@user_owns_object
def delete_my_product(request, product_id):
    """
    1. User must be logged in
    2. Must be POST request
    3. User must own the product
    """
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return redirect('product_list')

# For class-based views
from django.utils.decorators import method_decorator

@method_decorator(login_required, name='dispatch')
@method_decorator(require_POST, name='dispatch')
class ProductDeleteView(View):
    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        product.delete()
        return redirect('product_list')
```

---

## Mixins

**Reusable functionality for class-based views.**

### Built-in Authentication Mixins

```python
from django.contrib.auth.mixins import (
    LoginRequiredMixin,
    PermissionRequiredMixin,
    UserPassesTestMixin
)
from django.views.generic import ListView, CreateView, UpdateView

# Login required
class DashboardView(LoginRequiredMixin, ListView):
    """User must be logged in"""
    model = Product
    login_url = '/login/'  # Where to redirect
    redirect_field_name = 'next'  # Query parameter for next URL

# Permission required
class ProductCreateView(PermissionRequiredMixin, CreateView):
    """User must have permission"""
    model = Product
    form_class = ProductForm
    permission_required = 'products.add_product'
    
    # For multiple permissions (all required)
    # permission_required = ['products.add_product', 'products.change_product']

# Custom user test
class PremiumContentView(UserPassesTestMixin, ListView):
    """Only premium members"""
    model = Content
    
    def test_func(self):
        """Return True if user should have access"""
        return self.request.user.profile.is_premium
    
    def handle_no_permission(self):
        """What to do if test fails"""
        messages.error(self.request, 'Premium subscription required')
        return redirect('subscribe')
```

### Custom Mixins

```python
# Success message mixin
class SuccessMessageMixin:
    """Add success message after form submission"""
    success_message = ""
    
    def form_valid(self, form):
        response = super().form_valid(form)
        if self.success_message:
            messages.success(self.request, self.success_message)
        return response

class ProductCreateView(SuccessMessageMixin, CreateView):
    model = Product
    form_class = ProductForm
    success_message = "Product created successfully!"

# Set created_by field mixin
class SetCreatedByMixin:
    """Automatically set created_by to current user"""
    def form_valid(self, form):
        form.instance.created_by = self.request.user
        return super().form_valid(form)

class ArticleCreateView(LoginRequiredMixin, SetCreatedByMixin, CreateView):
    model = Article
    fields = ['title', 'content']

# User owns object mixin
class UserOwnsObjectMixin:
    """Ensure user owns the object being modified"""
    def dispatch(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.created_by != request.user:
            messages.error(request, "You don't own this resource")
            return redirect('product_list')
        return super().dispatch(request, *args, **kwargs)

class ProductUpdateView(LoginRequiredMixin, UserOwnsObjectMixin, UpdateView):
    """User can only edit their own products"""
    model = Product
    fields = ['name', 'price', 'description']

# AJAX response mixin
class AjaxResponseMixin:
    """Return JSON for AJAX requests"""
    def form_invalid(self, form):
        response = super().form_invalid(form)
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse(form.errors, status=400)
        return response
    
    def form_valid(self, form):
        response = super().form_valid(form)
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'id': self.object.pk,
                'url': self.object.get_absolute_url()
            })
        return response

class ProductCreateView(AjaxResponseMixin, CreateView):
    model = Product
    form_class = ProductForm

# Form initial data mixin
class FormInitialMixin:
    """Pre-populate form with user data"""
    def get_initial(self):
        initial = super().get_initial()
        if self.request.user.is_authenticated:
            initial['email'] = self.request.user.email
            initial['name'] = self.request.user.get_full_name()
        return initial

class ContactFormView(FormInitialMixin, FormView):
    form_class = ContactForm
    template_name = 'contact.html'
```

### Mixin Order Matters!

```python
# ✅ CORRECT ORDER
# Most specific → Least specific (left to right)
# Base view always last
class ProductUpdateView(
    LoginRequiredMixin,        # 1. Check auth first
    PermissionRequiredMixin,   # 2. Then check permission
    UserOwnsObjectMixin,       # 3. Then check ownership
    SuccessMessageMixin,       # 4. Then add message
    UpdateView                 # 5. Base view last
):
    model = Product
    fields = ['name', 'price']
    permission_required = 'products.change_product'
    success_message = "Product updated!"

# ❌ WRONG ORDER
class ProductUpdateView(
    UpdateView,                # Base should be last!
    LoginRequiredMixin,
    SuccessMessageMixin
):
    pass

# General Rule:
# Mixins (left to right) → Base Generic View (rightmost)
```

---

## REST Framework Views

**Building APIs with Django REST Framework.**

### Installation

```bash
pip install djangorestframework
```

```python
# settings.py
INSTALLED_APPS = [
    ...
    'rest_framework',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
}
```

### APIView (Base API Class)

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

class ProductListAPIView(APIView):
    """List and create products"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """List all products"""
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create new product"""
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailAPIView(APIView):
    """Retrieve, update, delete product"""
    
    def get(self, request, pk):
        """Get product"""
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Update product"""
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete product"""
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### Generic API Views

```python
from rest_framework import generics

# List all
class ProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# Create
class ProductCreateAPIView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# List + Create combined
class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

# Retrieve single
class ProductDetailAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# Update
class ProductUpdateAPIView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# Delete
class ProductDeleteAPIView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# Retrieve + Update + Delete combined
class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

### ViewSets (All CRUD in One Class)

```python
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

class ProductViewSet(viewsets.ModelViewSet):
    """
    Complete CRUD API:
    - list: GET /api/products/
    - create: POST /api/products/
    - retrieve: GET /api/products/{id}/
    - update: PUT /api/products/{id}/
    - partial_update: PATCH /api/products/{id}/
    - destroy: DELETE /api/products/{id}/
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Customize queryset"""
        queryset = super().get_queryset()
        
        # Optimize
        queryset = queryset.select_related('category')
        queryset = queryset.prefetch_related('tags')
        
        # Filter
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        return queryset
    
    def get_serializer_class(self):
        """Different serializers for different actions"""
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
    
    def get_permissions(self):
        """Different permissions per action"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Called before saving new object"""
        serializer.save(created_by=self.request.user)
    
    # Custom actions
    @action(detail=True, methods=['post'])
    def mark_featured(self, request, pk=None):
        """
        Custom endpoint: POST /api/products/{id}/mark_featured/
        """
        product = self.get_object()
        product.is_featured = True
        product.save()
        return Response({'status': 'product marked as featured'})
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Custom endpoint: GET /api/products/featured/
        """
        featured = self.get_queryset().filter(is_featured=True)
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)

# Router configuration
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

### Function-Based API Views

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_list(request):
    """List and create products"""
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def product_detail(request, pk):
    """Retrieve, update, delete product"""
    product = get_object_or_404(Product, pk=pk)
    
    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### Filtering & Searching

```bash
# Install django-filter
pip install django-filter
```

```python
# settings.py
INSTALLED_APPS = [
    ...
    'django_filters',
]

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ]
}

# views.py
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Simple filtering
    filterset_fields = ['category', 'is_active']
    
    # Search
    search_fields = ['name', 'description']
    
    # Ordering
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']  # Default

# Usage:
# /api/products/?category=1
# /api/products/?search=laptop
# /api/products/?ordering=-price
# /api/products/?category=1&search=laptop&ordering=price
```

### Pagination

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25
}

# Custom pagination
from rest_framework.pagination import PageNumberPagination

class StandardResultsPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = StandardResultsPagination

# Response format:
"""
{
    "count": 100,
    "next": "http://api.example.com/products/?page=2",
    "previous": null,
    "results": [
        {...},
        {...}
    ]
}
"""
```

---

## Best Practices

### 1. Use Appropriate View Type

```python
# ✅ Simple view → FBV
def hello(request):
    return HttpResponse("Hello")

# ✅ Complex CRUD → Generic CBV
class ProductListView(ListView):
    model = Product
    paginate_by = 25
```

### 2. Always Optimize Queries

```python
# ❌ BAD: N+1 queries
products = Product.objects.all()
for product in products:
    print(product.category.name)  # Each triggers query

# ✅ GOOD: One query with JOIN
products = Product.objects.select_related('category').all()
```

### 3. Use get_object_or_404

```python
# ❌ BAD
try:
    product = Product.objects.get(slug=slug)
except Product.DoesNotExist:
    raise Http404()

# ✅ GOOD
product = get_object_or_404(Product, slug=slug)
```

### 4. Always Redirect After POST

```python
# ❌ BAD: Render after POST (duplicate submission on refresh)
if request.method == 'POST':
    form.save()
    return render(request, 'success.html')

# ✅ GOOD: Redirect after POST (PRG pattern)
if request.method == 'POST':
    product = form.save()
    return redirect('product_detail', slug=product.slug)
```

### 5. Use Messages Framework

```python
from django.contrib import messages

def create_product(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            product = form.save()
            messages.success(request, 'Product created successfully!')
            return redirect('product_detail', slug=product.slug)
```

### 6. Keep Views Thin

```python
# ❌ BAD: Too much logic in view
def create_order(request):
    order = Order.objects.create(user=request.user)
    for item in cart_items:
        OrderItem.objects.create(...)
        # Update inventory
        # Send emails
        # Log activity
    # ... 50 more lines

# ✅ GOOD: Move logic to services/models
def create_order(request):
    order = OrderService.create_order(request.user, cart_items)
    return redirect('order_detail', order.id)
```

### 7. Use Pagination

```python
# ✅ Always paginate large datasets
class ProductListView(ListView):
    model = Product
    paginate_by = 25  # Never load all records
```

### 8. Use Proper HTTP Status Codes

```python
return Response(data, status=status.HTTP_200_OK)         # Success
return Response(data, status=status.HTTP_201_CREATED)    # Created
return Response(status=status.HTTP_204_NO_CONTENT)       # Deleted
return Response(errors, status=status.HTTP_400_BAD_REQUEST)  # Bad request
return Response(error, status=status.HTTP_401_UNAUTHORIZED)   # Not authenticated
return Response(error, status=status.HTTP_403_FORBIDDEN)      # Forbidden
return Response(error, status=status.HTTP_404_NOT_FOUND)      # Not found
```

### 9. Validate Input

```python
# Always validate user input
form = ProductForm(request.POST)
if form.is_valid():
    # Clean, validated data in form.cleaned_data
    product = form.save()
else:
    # form.errors contains validation errors
    return render(request, 'form.html', {'form': form})
```

### 10. Use Context Processors for Common Data

```python
# context_processors.py
def common_data(request):
    return {
        'site_name': 'My Store',
        'categories': Category.objects.all(),
        'cart_count': get_cart_count(request)
    }

# settings.py
TEMPLATES = [{
    'OPTIONS': {
        'context_processors': [
            ...
            'myapp.context_processors.common_data',
        ],
    },
}]
```

---

## Quick Reference

### Function-Based Views
```python
def view(request, param):
    # Logic here
    return HttpResponse/render/redirect
```

### Class-Based Views
```python
class MyView(View):
    def get(self, request):
        pass
    def post(self, request):
        pass
```

### Generic Views
- **ListView** - List objects
- **DetailView** - Single object
- **CreateView** - Create form
- **UpdateView** - Update form
- **DeleteView** - Delete confirmation
- **FormView** - Non-model form

### Decorators
- `@login_required` - Authentication
- `@permission_required` - Permissions
- `@require_POST` - HTTP methods
- `@cache_page(60*15)` - Caching
- `@api_view(['GET', 'POST'])` - DRF

### DRF Views
- **APIView** - Base
- **ListAPIView** - List
- **CreateAPIView** - Create
- **RetrieveAPIView** - Detail
- **ViewSet** - All CRUD

### Response Types
```python
HttpResponse("text")
render(request, 'template.html', context)
redirect('url_name')
JsonResponse({'key': 'value'})
```
