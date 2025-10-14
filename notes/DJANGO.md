# Django Backend Developer Cheatsheet

## Project Setup & Structure

### Create Project
```bash
django-admin startproject projectname
python manage.py startapp appname
```

### Project Structure
```
projectname/
├── manage.py
├── projectname/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
└── appname/
    ├── migrations/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── models.py
    ├── tests.py
    └── views.py
```

### Settings Configuration
```python
# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'appname',
    'rest_framework',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'dbname',
        'USER': 'dbuser',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
        'ATOMIC_REQUESTS': True,  # Wrap each view in transaction
        'CONN_MAX_AGE': 600,  # Connection pooling
    }
}

# Multiple databases
DATABASES = {
    'default': {...},
    'users_db': {...},
    'analytics_db': {...},
}

DATABASE_ROUTERS = ['path.to.router.DatabaseRouter']
```

## Models & ORM

### Model Definition
```python
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

class BaseModel(models.Model):
    """Abstract base model with common fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        abstract = True

class Category(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "categories"
        ordering = ['name']
        indexes = [
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.name

class Product(BaseModel):
    # Field types
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    available = models.BooleanField(default=True)
    
    # Relationships
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE,
        related_name='products'
    )
    tags = models.ManyToManyField('Tag', related_name='products', blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_products'
    )
    
    # File fields
    image = models.ImageField(upload_to='products/%Y/%m/%d/', blank=True)
    document = models.FileField(upload_to='documents/', blank=True)
    
    # JSON field
    metadata = models.JSONField(default=dict, blank=True)
    
    # Validators
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug', '-created_at']),
            models.Index(fields=['category', 'available']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(price__gte=0),
                name='price_non_negative'
            ),
            models.UniqueConstraint(
                fields=['name', 'category'],
                name='unique_product_per_category'
            )
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Custom save logic
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('product_detail', args=[self.slug])
    
    @property
    def is_in_stock(self):
        return self.stock > 0

class Order(BaseModel):
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('shipped', _('Shipped')),
        ('delivered', _('Delivered')),
        ('cancelled', _('Cancelled')),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        ordering = ['-created_at']
```

### Advanced Model Fields
```python
from django.contrib.postgres.fields import ArrayField, HStoreField
from django.contrib.postgres.indexes import GinIndex

class AdvancedProduct(models.Model):
    # PostgreSQL specific
    tags_array = ArrayField(models.CharField(max_length=50), blank=True, default=list)
    attributes = HStoreField(default=dict)
    
    # Full-text search
    search_vector = models.GeneratedField(
        expression=SearchVector('name', 'description'),
        output_field=SearchVectorField(),
        db_persist=True
    )
    
    class Meta:
        indexes = [
            GinIndex(fields=['search_vector']),
        ]
```

### QuerySet Operations
```python
# Basic queries
Product.objects.all()
Product.objects.filter(available=True)
Product.objects.exclude(stock=0)
Product.objects.get(id=1)

# Complex queries
from django.db.models import Q, F, Count, Sum, Avg, Max, Min, Prefetch

# Q objects for complex queries
products = Product.objects.filter(
    Q(name__icontains='laptop') | Q(description__icontains='laptop'),
    price__gte=500,
    available=True
).exclude(stock=0)

# F expressions for field comparisons
Product.objects.filter(stock__lt=F('reserved'))
Product.objects.update(price=F('price') * 1.1)  # Increase price by 10%

# Aggregation
stats = Product.objects.aggregate(
    total=Count('id'),
    avg_price=Avg('price'),
    max_price=Max('price'),
    total_value=Sum(F('price') * F('stock'))
)

# Annotate
categories = Category.objects.annotate(
    product_count=Count('products'),
    avg_product_price=Avg('products__price')
).filter(product_count__gt=5)

# Select related (ForeignKey, OneToOne) - single query with JOIN
products = Product.objects.select_related('category', 'created_by').all()

# Prefetch related (ManyToMany, reverse ForeignKey) - separate queries
products = Product.objects.prefetch_related('tags', 'reviews').all()

# Custom prefetch
products = Product.objects.prefetch_related(
    Prefetch('reviews', queryset=Review.objects.filter(rating__gte=4))
).all()

# Only/Defer for field selection
Product.objects.only('name', 'price')  # Select only these fields
Product.objects.defer('description')   # Exclude this field

# Values and values_list
Product.objects.values('name', 'price')  # Returns dict
Product.objects.values_list('name', 'price')  # Returns tuple
Product.objects.values_list('name', flat=True)  # Returns flat list

# Distinct
Product.objects.values('category').distinct()

# Exists
if Product.objects.filter(slug=slug).exists():
    pass

# Bulk operations
Product.objects.bulk_create([
    Product(name='Product 1', price=100),
    Product(name='Product 2', price=200),
], ignore_conflicts=True)

Product.objects.bulk_update(products, ['price', 'stock'])

# Update or create
product, created = Product.objects.update_or_create(
    slug='my-product',
    defaults={'price': 100, 'stock': 50}
)

# Get or create
product, created = Product.objects.get_or_create(
    slug='my-product',
    defaults={'price': 100}
)

# Raw SQL
products = Product.objects.raw('SELECT * FROM appname_product WHERE price > %s', [100])

# Execute custom SQL
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM appname_product WHERE price > %s", [100])
    rows = cursor.fetchall()
```

### Custom Managers & QuerySets
```python
from django.db import models

class ProductQuerySet(models.QuerySet):
    def available(self):
        return self.filter(available=True, stock__gt=0)
    
    def in_price_range(self, min_price, max_price):
        return self.filter(price__gte=min_price, price__lte=max_price)
    
    def with_category(self):
        return self.select_related('category')

class ProductManager(models.Manager):
    def get_queryset(self):
        return ProductQuerySet(self.model, using=self._db)
    
    def available(self):
        return self.get_queryset().available()
    
    def featured(self):
        return self.get_queryset().filter(is_featured=True).available()

class Product(models.Model):
    # ... fields ...
    
    objects = ProductManager()
    all_objects = models.Manager()  # Default manager for admin

# Usage
Product.objects.available().in_price_range(100, 500)
```

### Database Transactions
```python
from django.db import transaction

# Atomic decorator
@transaction.atomic
def create_order(user, items):
    order = Order.objects.create(user=user)
    for item in items:
        OrderItem.objects.create(order=order, **item)
    return order

# Context manager
def process_payment(order):
    try:
        with transaction.atomic():
            order.status = 'paid'
            order.save()
            
            # This will rollback if exception occurs
            payment = Payment.objects.create(order=order)
            send_confirmation_email(order)
    except Exception as e:
        logger.error(f"Payment failed: {e}")
        raise

# Savepoints
with transaction.atomic():
    # Create savepoint
    sid = transaction.savepoint()
    
    try:
        # Some operations
        user.save()
    except:
        # Rollback to savepoint
        transaction.savepoint_rollback(sid)
    else:
        # Commit savepoint
        transaction.savepoint_commit(sid)

# Database routing
class Product(models.Model):
    class Meta:
        db_table = 'products'
    
    def save(self, *args, **kwargs):
        using = kwargs.get('using', 'default')
        super().save(*args, **kwargs)

# Usage with specific database
Product.objects.using('analytics_db').filter(...)
```

## Views

### Function-Based Views (FBV)
```python
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse, Http404
from django.views.decorators.http import require_http_methods, require_POST
from django.views.decorators.cache import cache_page
from django.contrib.auth.decorators import login_required, permission_required
from django.db.models import Prefetch

@require_http_methods(["GET", "POST"])
@login_required
@cache_page(60 * 15)  # Cache for 15 minutes
def product_list(request):
    products = Product.objects.select_related('category').prefetch_related('tags')
    
    # Filtering
    category_id = request.GET.get('category')
    if category_id:
        products = products.filter(category_id=category_id)
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(products, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'categories': Category.objects.all()
    }
    return render(request, 'products/list.html', context)

@require_POST
@login_required
def create_product(request):
    form = ProductForm(request.POST, request.FILES)
    if form.is_valid():
        product = form.save(commit=False)
        product.created_by = request.user
        product.save()
        form.save_m2m()  # Save many-to-many relationships
        return redirect('product_detail', slug=product.slug)
    return render(request, 'products/form.html', {'form': form})

def product_detail(request, slug):
    product = get_object_or_404(
        Product.objects.select_related('category'),
        slug=slug
    )
    return render(request, 'products/detail.html', {'product': product})

# JSON response
def api_products(request):
    products = Product.objects.values('id', 'name', 'price')
    return JsonResponse(list(products), safe=False)
```

### Class-Based Views (CBV)
```python
from django.views.generic import (
    ListView, DetailView, CreateView, UpdateView, DeleteView, TemplateView
)
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.urls import reverse_lazy
from django.db.models import Q

class ProductListView(LoginRequiredMixin, ListView):
    model = Product
    template_name = 'products/list.html'
    context_object_name = 'products'
    paginate_by = 25
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('category').prefetch_related('tags')
        
        # Search
        search = self.request.GET.get('q')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Filter
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        return queryset.filter(available=True)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        context['search_query'] = self.request.GET.get('q', '')
        return context

class ProductDetailView(DetailView):
    model = Product
    template_name = 'products/detail.html'
    context_object_name = 'product'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    
    def get_queryset(self):
        return super().get_queryset().select_related('category', 'created_by')

class ProductCreateView(LoginRequiredMixin, PermissionRequiredMixin, CreateView):
    model = Product
    form_class = ProductForm
    template_name = 'products/form.html'
    success_url = reverse_lazy('product_list')
    permission_required = 'products.add_product'
    
    def form_valid(self, form):
        form.instance.created_by = self.request.user
        return super().form_valid(form)

class ProductUpdateView(LoginRequiredMixin, UpdateView):
    model = Product
    form_class = ProductForm
    template_name = 'products/form.html'
    
    def get_success_url(self):
        return reverse_lazy('product_detail', kwargs={'slug': self.object.slug})

class ProductDeleteView(LoginRequiredMixin, PermissionRequiredMixin, DeleteView):
    model = Product
    template_name = 'products/confirm_delete.html'
    success_url = reverse_lazy('product_list')
    permission_required = 'products.delete_product'

# Custom mixins
class AjaxableResponseMixin:
    def form_invalid(self, form):
        response = super().form_invalid(form)
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse(form.errors, status=400)
        return response
    
    def form_valid(self, form):
        response = super().form_valid(form)
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            data = {'pk': self.object.pk}
            return JsonResponse(data)
        return response
```

### API Views (Django REST Framework)
```python
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').prefetch_related('tags')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'available']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']
    throttle_classes = [UserRateThrottle]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_available(self, request, pk=None):
        product = self.get_object()
        product.available = True
        product.save()
        return Response({'status': 'product marked as available'})
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

# Function-based API view
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_api(request):
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

## URLs & Routing

```python
# urls.py
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

# App-specific URLs
app_name = 'products'

urlpatterns = [
    # Function-based views
    path('', views.product_list, name='product_list'),
    path('create/', views.create_product, name='product_create'),
    path('<slug:slug>/', views.product_detail, name='product_detail'),
    
    # Class-based views
    path('cbv/', views.ProductListView.as_view(), name='product_list_cbv'),
    path('cbv/<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail_cbv'),
    
    # Regex patterns
    re_path(r'^archive/(?P<year>[0-9]{4})/$', views.year_archive, name='year_archive'),
    
    # Include other apps
    path('api/v1/', include('api.urls')),
]

# REST Framework Router
router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'categories', views.CategoryViewSet)

urlpatterns += [
    path('api/', include(router.urls)),
]

# Media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Project-level urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('products/', include('products.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
```

## Forms

```python
from django import forms
from django.core.exceptions import ValidationError

class ProductForm(forms.ModelForm):
    # Additional fields not in model
    agree_terms = forms.BooleanField(required=True)
    
    class Meta:
        model = Product
        fields = ['name', 'slug', 'description', 'price', 'stock', 'category', 'tags', 'image']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
            'tags': forms.CheckboxSelectMultiple(),
        }
        labels = {
            'name': 'Product Name',
            'slug': 'URL Slug',
        }
        help_texts = {
            'slug': 'URL-friendly version of the name',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['category'].queryset = Category.objects.filter(is_active=True)
        self.fields['name'].widget.attrs.update({'class': 'form-control'})
    
    def clean_slug(self):
        slug = self.cleaned_data['slug']
        if Product.objects.filter(slug=slug).exclude(pk=self.instance.pk).exists():
            raise ValidationError('This slug is already in use.')
        return slug
    
    def clean_price(self):
        price = self.cleaned_data['price']
        if price <= 0:
            raise ValidationError('Price must be greater than zero.')
        return price
    
    def clean(self):
        cleaned_data = super().clean()
        stock = cleaned_data.get('stock')
        available = cleaned_data.get('available')
        
        if available and stock == 0:
            raise ValidationError('Cannot mark as available with zero stock.')
        
        return cleaned_data

# Regular Django form
class ContactForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    subject = forms.CharField(max_length=200)
    message = forms.CharField(widget=forms.Textarea)
    
    def send_email(self):
        # Send email logic
        pass

# Form with file upload
class ProductImageForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['image']
    
    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image:
            if image.size > 5 * 1024 * 1024:  # 5MB
                raise ValidationError('Image file too large ( > 5MB )')
            return image
```

## Serializers (DRF)

```python
from rest_framework import serializers
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'product_count']
        read_only_fields = ['slug']

class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'stock', 'category', 'available']

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive.")
        return value
    
    def validate(self, data):
        if data.get('available') and data.get('stock', 0) == 0:
            raise serializers.ValidationError("Cannot mark as available with zero stock.")
        return data
    
    def create(self, validated_data):
        # Custom create logic
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Custom update logic
        return super().update(instance, validated_data)

# Nested serializers
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'items', 'total_amount', 'created_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

# SerializerMethodField
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'category_name', 'discounted_price']
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_discounted_price(self, obj):
        discount = self.context.get('discount', 0)
        return obj.price * (1 - discount / 100)

# HyperlinkedModelSerializer
class ProductHyperlinkedSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Product
        fields = ['url', 'name', 'price', 'category']
```

## Authentication & Permissions

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Custom permissions
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

# Using permissions in views
from rest_framework.permissions import IsAuthenticated, AllowAny

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        elif self.action in ['create', 'update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrReadOnly()]
        return super().get_permissions()

# JWT Authentication
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Custom user authentication
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password

def user_login(request):
    username = request.POST.get('username')
    password = request.POST.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return redirect('home')
    return render(request, 'login.html', {'error': 'Invalid credentials'})

# Custom User model
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = CustomUserManager()

# In settings.py
AUTH_USER_MODEL = 'accounts.CustomUser'
```

## Middleware

```python
# middleware.py
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Before view
        logger.info(f"{request.method} {request.path}")
        
        response = self.get_response(request)
        
        # After view
        logger.info(f"Response status: {response.status_code}")
        
        return response
    
    def process_exception(self, request, exception):
        logger.error(f"Exception: {exception}")
        return None

class CustomHeaderMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        response['X-Custom-Header'] = 'CustomValue'
        return response

class APIKeyAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.path.startswith('/api/'):
            api_key = request.headers.get('X-API-Key')
            if not api_key or not self.validate_api_key(api_key):
                return JsonResponse({'error': 'Invalid API key'}, status=401)
        
        return self.get_response(request)
    
    def validate_api_key(self, api_key):
        # Validation logic
        return True

# Add to settings.py
MIDDLEWARE = [
    # ...
    'myapp.middleware.RequestLoggingMiddleware',
    'myapp.middleware.CustomHeaderMiddleware',
]
```

## Caching

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'myapp',
        'TIMEOUT': 300,
    }
}

# View caching
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

@cache_page(60 * 15)  # Cache for 15 minutes
def product_list(request):
    products = Product.objects.all()
    return render(request, 'products/list.html', {'products': products})

class ProductListView(ListView):
    model = Product
    
    @method_decorator(cache_page(60 * 15))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

# Template fragment caching
{% load cache %}
{% cache 500 sidebar request.user.username %}
    .. sidebar for logged in user ..
{% endcache %}

# Low-level cache API
from django.core.cache import cache

# Set
cache.set('my_key', 'my_value', 300)  # 300 seconds

# Get
value = cache.get('my_key', 'default_value')

# Delete
cache.delete('my_key')

# Get or set
value = cache.get_or_set('my_key', lambda: expensive_computation(), 300)

# Multiple keys
cache.set_many({'key1': 'value1', 'key2': 'value2'}, 300)
values = cache.get_many(['key1', 'key2'])
cache.delete_many(['key1', 'key2'])

# Clear all
cache.clear()

# Cache with version
cache.set('my_key', 'value', version=2)
value = cache.get('my_key', version=2)

# Query caching pattern
def get_products():
    cache_key = 'products_list'
    products = cache.get(cache_key)
    
    if products is None:
        products = list(Product.objects.select_related('category').all())
        cache.set(cache_key, products, 60 * 15)
    
    return products
```

## Signals

```python
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete, m2m_changed
from django.dispatch import receiver, Signal
from django.contrib.auth.signals import user_logged_in, user_logged_out

# Custom signal
order_placed = Signal()

# Receivers
@receiver(post_save, sender=Product)
def product_post_save(sender, instance, created, **kwargs):
    if created:
        print(f"New product created: {instance.name}")
        # Send notification, update cache, etc.
    else:
        print(f"Product updated: {instance.name}")
        # Invalidate cache
        cache.delete(f'product_{instance.id}')

@receiver(pre_delete, sender=Product)
def product_pre_delete(sender, instance, **kwargs):
    print(f"Product being deleted: {instance.name}")
    # Clean up related data, files, etc.
    if instance.image:
        instance.image.delete(save=False)

@receiver(m2m_changed, sender=Product.tags.through)
def tags_changed(sender, instance, action, **kwargs):
    if action in ['post_add', 'post_remove', 'post_clear']:
        print(f"Tags changed for product: {instance.name}")
        # Update search index, cache, etc.

@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    print(f"User {user.username} logged in")
    # Log activity, update last login, etc.

# Manual connection (in apps.py)
from django.apps import AppConfig

class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'
    
    def ready(self):
        import products.signals  # Import signals module

# Sending custom signals
order_placed.send(sender=Order, order=order_instance, user=user)

# Receiving custom signals
@receiver(order_placed)
def handle_order_placed(sender, order, user, **kwargs):
    # Send email, update inventory, etc.
    pass

# Disconnecting signals
from django.db.models.signals import post_save
post_save.disconnect(product_post_save, sender=Product)
```

## Testing

```python
from django.test import TestCase, TransactionTestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, Mock

class ProductModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up data for the whole TestCase
        cls.category = Category.objects.create(name='Electronics', slug='electronics')
        cls.user = User.objects.create_user(username='testuser', password='12345')
    
    def setUp(self):
        # Set up data for each test method
        self.product = Product.objects.create(
            name='Test Product',
            slug='test-product',
            price=100.00,
            stock=10,
            category=self.category
        )
    
    def test_product_creation(self):
        self.assertEqual(self.product.name, 'Test Product')
        self.assertEqual(self.product.price, 100.00)
        self.assertTrue(isinstance(self.product, Product))
    
    def test_product_str(self):
        self.assertEqual(str(self.product), 'Test Product')
    
    def test_get_absolute_url(self):
        url = self.product.get_absolute_url()
        self.assertEqual(url, '/products/test-product/')
    
    def test_is_in_stock(self):
        self.assertTrue(self.product.is_in_stock)
        self.product.stock = 0
        self.assertFalse(self.product.is_in_stock)

class ProductViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            name='Test Product',
            slug='test-product',
            price=100.00,
            category=self.category
        )
    
    def test_product_list_view(self):
        response = self.client.get(reverse('product_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Product')
        self.assertTemplateUsed(response, 'products/list.html')
    
    def test_product_detail_view(self):
        response = self.client.get(reverse('product_detail', args=[self.product.slug]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['product'], self.product)
    
    def test_product_create_view_login_required(self):
        response = self.client.get(reverse('product_create'))
        self.assertEqual(response.status_code, 302)  # Redirect to login
    
    def test_product_create_view_authenticated(self):
        self.client.login(username='testuser', password='12345')
        response = self.client.post(reverse('product_create'), {
            'name': 'New Product',
            'slug': 'new-product',
            'price': 150.00,
            'stock': 5,
            'category': self.category.id,
        })
        self.assertEqual(Product.objects.count(), 2)
        self.assertEqual(Product.objects.last().name, 'New Product')

class ProductAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            name='Test Product',
            slug='test-product',
            price=100.00,
            category=self.category
        )
    
    def test_get_product_list(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_create_product(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'New Product',
            'slug': 'new-product',
            'price': 150.00,
            'stock': 5,
            'category': self.category.id,
        }
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)
    
    def test_update_product(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/products/{self.product.id}/'
        data = {'price': 120.00}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, 120.00)
    
    def test_delete_product(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/products/{self.product.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)

# Mocking external services
class PaymentTest(TestCase):
    @patch('stripe.Charge.create')
    def test_process_payment(self, mock_charge):
        mock_charge.return_value = Mock(id='ch_123', status='succeeded')
        
        result = process_payment(amount=100, token='tok_123')
        
        self.assertTrue(result['success'])
        mock_charge.assert_called_once()

# Testing with fixtures
class ProductFixtureTest(TestCase):
    fixtures = ['categories.json', 'products.json']
    
    def test_fixture_loading(self):
        self.assertEqual(Product.objects.count(), 5)
        self.assertEqual(Category.objects.count(), 3)

# Run tests
# python manage.py test
# python manage.py test products
# python manage.py test products.tests.ProductModelTest
# python manage.py test --keepdb  # Preserve test database
# python manage.py test --parallel  # Run tests in parallel
```

## Celery (Async Tasks)

```python
# settings.py
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_BEAT_SCHEDULE = {
    'send-daily-report': {
        'task': 'products.tasks.send_daily_report',
        'schedule': crontab(hour=9, minute=0),
    },
}

# celery.py (in project root)
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

app = Celery('myproject')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# tasks.py
from celery import shared_task
from django.core.mail import send_mail
from .models import Product

@shared_task
def send_email_notification(subject, message, recipient_list):
    send_mail(subject, message, 'from@example.com', recipient_list)

@shared_task
def update_product_prices():
    products = Product.objects.filter(available=True)
    for product in products:
        # Update pricing logic
        product.price *= 1.05
        product.save()

@shared_task(bind=True, max_retries=3)
def process_order(self, order_id):
    try:
        order = Order.objects.get(id=order_id)
        # Processing logic
        order.status = 'processed'
        order.save()
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)

# Usage in views
from .tasks import send_email_notification

def create_order(request):
    # ... order creation logic ...
    send_email_notification.delay(
        'Order Confirmation',
        'Your order has been received.',
        [request.user.email]
    )

# Start Celery worker
# celery -A myproject worker -l info
# celery -A myproject beat -l info  # For periodic tasks
```

## Security Best Practices

```python
# settings.py

# HTTPS/SSL
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CSRF
CSRF_COOKIE_HTTPONLY = True
CSRF_TRUSTED_ORIGINS = ['https://yourdomain.com']

# Security headers
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 9}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Allowed hosts
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']

# Secret key - use environment variables
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# Debug
DEBUG = False  # Never in production

# Database connection security
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Rate limiting with Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
}

# Input sanitization
from django.utils.html import escape
safe_input = escape(user_input)

# SQL injection prevention - always use ORM
# Bad:
User.objects.raw("SELECT * FROM users WHERE name = '%s'" % name)
# Good:
User.objects.filter(name=name)
```

## Performance Optimization

```python
# Database optimization
from django.db.models import Prefetch, F, Q

# Use select_related for ForeignKey and OneToOne
products = Product.objects.select_related('category', 'created_by')

# Use prefetch_related for ManyToMany and reverse ForeignKey
products = Product.objects.prefetch_related('tags', 'reviews')

# Custom prefetch
active_reviews = Review.objects.filter(is_active=True)
products = Product.objects.prefetch_related(
    Prefetch('reviews', queryset=active_reviews, to_attr='active_reviews')
)

# Only fetch needed fields
Product.objects.only('name', 'price')
Product.objects.defer('description', 'metadata')

# Use values/values_list for dictionaries/tuples
Product.objects.values('name', 'price')

# Bulk operations
Product.objects.bulk_create([...])
Product.objects.bulk_update(products, ['price', 'stock'])

# Use iterator for large datasets
for product in Product.objects.iterator(chunk_size=1000):
    process(product)

# Database indexes
class Product(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['slug', '-created_at']),
            models.Index(fields=['category', 'available']),
        ]

# Query optimization with explain
qs = Product.objects.filter(price__gt=100)
print(qs.explain())

# Use database functions
from django.db.models.functions import Lower, Upper
Product.objects.annotate(lower_name=Lower('name'))

# Connection pooling
DATABASES = {
    'default': {
        'CONN_MAX_AGE': 600,  # 10 minutes
    }
}

# Caching strategies
from django.core.cache import cache
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)
def expensive_view(request):
    data = expensive_computation()
    return render(request, 'template.html', {'data': data})

# Query result caching
def get_products_cached():
    cache_key = 'all_products'
    products = cache.get(cache_key)
    if not products:
        products = list(Product.objects.all())
        cache.set(cache_key, products, 300)
    return products
```

## Management Commands

```python
# management/commands/update_products.py
from django.core.management.base import BaseCommand, CommandError
from products.models import Product

class Command(BaseCommand):
    help = 'Update product prices'
    
    def add_arguments(self, parser):
        parser.add_argument('--percentage', type=float, default=10.0)
        parser.add_argument('--category', type=str)
        parser.add_argument('--dry-run', action='store_true')
    
    def handle(self, *args, **options):
        percentage = options['percentage']
        category = options['category']
        dry_run = options['dry_run']
        
        products = Product.objects.all()
        
        if category:
            products = products.filter(category__slug=category)
        
        count = 0
        for product in products:
            old_price = product.price
            new_price = old_price * (1 + percentage / 100)
            
            if not dry_run:
                product.price = new_price
                product.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'{product.name}: {old_price} -> {new_price}'
                )
            )
            count += 1
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - no changes made'))
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {count} products')
            )

# Run command:
# python manage.py update_products --percentage 15 --category electronics
```

## Logging

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'django.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'products': {
            'handlers': ['console', 'file', 'mail_admins'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Usage in code
import logging

logger = logging.getLogger('products')

logger.debug('Debug message')
logger.info('Info message')
logger.warning('Warning message')
logger.error('Error message')
logger.critical('Critical message')

# With exception info
try:
    risky_operation()
except Exception as e:
    logger.exception('An error occurred')
```

## Common Patterns

### Soft Delete
```python
class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

class Product(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    objects = SoftDeleteManager()
    all_objects = models.Manager()
    
    def delete(self, *args, **kwargs):
        self.deleted_at = timezone.now()
        self.save()
    
    def hard_delete(self):
        super().delete()
```

### Audit Trail
```python
class AuditMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='%(class)s_created', on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, related_name='%(class)s_updated', on_delete=models.SET_NULL, null=True)
    
    class Meta:
        abstract = True
```

### Slug Auto-generation
```python
from django.utils.text import slugify

def generate_unique_slug(model_class, title):
    slug = slugify(title)
    unique_slug = slug
    num = 1
    while model_class.objects.filter(slug=unique_slug).exists():
        unique_slug = f'{slug}-{num}'
        num += 1
    return unique_slug
```

This cheatsheet covers the essential Django concepts for senior backend developers. Refer to the official Django documentation for more detailed information on specific topics.