# Django REST API - Complete Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Setup & Installation](#setup--installation)
3. [Serializers](#serializers)
4. [Views](#views)
5. [URLs & Routing](#urls--routing)
6. [Authentication](#authentication)
7. [Permissions](#permissions)
8. [Filtering & Searching](#filtering--searching)
9. [Pagination](#pagination)
10. [Throttling](#throttling)
11. [Versioning](#versioning)
12. [Testing](#testing)
13. [Documentation](#documentation)
14. [Best Practices](#best-practices)
15. [Complete Example](#complete-example)

---

## Introduction

### What is a REST API?

**REST (Representational State Transfer)** is an architectural style for building web services.

**Key Principles:**
- **Stateless**: Each request contains all information needed
- **Client-Server**: Separation of concerns
- **Cacheable**: Responses can be cached
- **Uniform Interface**: Standard HTTP methods

**HTTP Methods:**
- **GET**: Retrieve data (Read)
- **POST**: Create new resource (Create)
- **PUT**: Update entire resource (Update)
- **PATCH**: Partially update resource (Partial Update)
- **DELETE**: Delete resource (Delete)

**Example API Endpoints:**
```
GET    /api/products/          - List all products
POST   /api/products/          - Create new product
GET    /api/products/1/        - Get product #1
PUT    /api/products/1/        - Update product #1
PATCH  /api/products/1/        - Partially update product #1
DELETE /api/products/1/        - Delete product #1
```

### Why Django REST Framework?

**Django REST Framework (DRF)** is the most popular library for building APIs in Django.

**Features:**
- ✅ Serialization (Model ↔ JSON)
- ✅ Authentication (Token, JWT, OAuth)
- ✅ Permissions
- ✅ Browsable API (Test in browser)
- ✅ Pagination
- ✅ Filtering & Searching
- ✅ Rate limiting (Throttling)
- ✅ Versioning
- ✅ Documentation (Swagger/OpenAPI)

---

## Setup & Installation

### Step 1: Create Django Project

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install Django
pip install django

# Create project
django-admin startproject myproject
cd myproject

# Create app
python manage.py startapp products
```

### Step 2: Install Django REST Framework

```bash
pip install djangorestframework
```

### Step 3: Configure Settings

```python
# myproject/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    
    # Your apps
    'products',
]

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}
```

### Step 4: Create Models

```python
# products/models.py
from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_products'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
```

### Step 5: Create and Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 6: Create Superuser

```bash
python manage.py createsuperuser
```

---

## Serializers

**Serializers convert complex data (models) to JSON and vice versa.**

### Basic Serializer

```python
# products/serializers.py
from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    """Serialize Category model"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    """Serialize Product model"""
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'stock', 'category', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

### Nested Serializers

**Show related data in API responses.**

```python
class ProductDetailSerializer(serializers.ModelSerializer):
    """Product with nested category"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'stock', 'category', 'category_id', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

**Why separate `category` and `category_id`?**
- `category`: Shows full category data in responses (read)
- `category_id`: Accepts category ID when creating/updating (write)

### SerializerMethodField

**Add custom calculated fields.**

```python
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'stock',
            'category_name', 'discounted_price', 'is_in_stock'
        ]
    
    def get_category_name(self, obj):
        """Get category name"""
        return obj.category.name if obj.category else None
    
    def get_discounted_price(self, obj):
        """Calculate discounted price"""
        discount = self.context.get('discount', 0)
        return float(obj.price * (1 - discount / 100))
    
    def get_is_in_stock(self, obj):
        """Check if in stock"""
        return obj.stock > 0
```

### Validation

**Add custom validation to serializers.**

```python
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
    
    def validate_price(self, value):
        """Validate price field"""
        if value <= 0:
            raise serializers.ValidationError("Price must be positive")
        if value > 1000000:
            raise serializers.ValidationError("Price too high")
        return value
    
    def validate_stock(self, value):
        """Validate stock field"""
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative")
        return value
    
    def validate(self, data):
        """Validate entire object"""
        # Cross-field validation
        if data.get('is_active') and data.get('stock', 0) == 0:
            raise serializers.ValidationError(
                "Cannot activate product with zero stock"
            )
        return data
```

### Custom Create/Update

**Override create and update methods.**

```python
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
    
    def create(self, validated_data):
        """Custom creation logic"""
        # Auto-generate slug from name
        if 'slug' not in validated_data:
            from django.utils.text import slugify
            validated_data['slug'] = slugify(validated_data['name'])
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Custom update logic"""
        # Log changes
        old_price = instance.price
        instance = super().update(instance, validated_data)
        
        if instance.price != old_price:
            print(f"Price changed from {old_price} to {instance.price}")
        
        return instance
```

---

## Views

### APIView (Base Class)

**Most flexible, but requires more code.**

```python
# products/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Product
from .serializers import ProductSerializer

class ProductListAPIView(APIView):
    """List all products and create new product"""
    
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
    """Retrieve, update, and delete product"""
    
    def get_object(self, pk):
        try:
            return Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return None
    
    def get(self, request, pk):
        """Get product"""
        product = self.get_object(pk)
        if not product:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Update product"""
        product = self.get_object(pk)
        if not product:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete product"""
        product = self.get_object(pk)
        if not product:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### Generic Views

**Pre-built views for common patterns.**

```python
from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer, ProductDetailSerializer

# List all products
class ProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# Create product
class ProductCreateAPIView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

# List and Create combined
class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        """Customize queryset"""
        queryset = super().get_queryset()
        # Optimize queries
        queryset = queryset.select_related('category')
        # Filter by query params
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        return queryset

# Retrieve, Update, Delete combined
class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'  # Use slug instead of pk
```

### ViewSets (Recommended)

**All CRUD operations in one class.**

```python
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product model
    
    Provides:
    - list: GET /api/products/
    - create: POST /api/products/
    - retrieve: GET /api/products/{id}/
    - update: PUT /api/products/{id}/
    - partial_update: PATCH /api/products/{id}/
    - destroy: DELETE /api/products/{id}/
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Customize queryset"""
        queryset = super().get_queryset()
        
        # Optimize
        queryset = queryset.select_related('category', 'created_by')
        
        # Filter by query parameters
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        is_active = self.request.query_params.get('is_active')
        if is_active:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return ProductSerializer
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
    def activate(self, request, slug=None):
        """
        Custom endpoint: POST /api/products/{slug}/activate/
        """
        product = self.get_object()
        product.is_active = True
        product.save()
        return Response({'status': 'product activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, slug=None):
        """
        Custom endpoint: POST /api/products/{slug}/deactivate/
        """
        product = self.get_object()
        product.is_active = False
        product.save()
        return Response({'status': 'product deactivated'})
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Custom endpoint: GET /api/products/active/
        """
        active_products = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """
        Custom endpoint: GET /api/products/low_stock/
        """
        low_stock = self.get_queryset().filter(stock__lt=10)
        serializer = self.get_serializer(low_stock, many=True)
        return Response(serializer.data)
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

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def product_detail(request, pk):
    """Retrieve, update, delete product"""
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ProductSerializer(product, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

---

## URLs & Routing

### Manual URL Configuration

```python
# products/urls.py
from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    # Using APIView
    path('products/', views.ProductListAPIView.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetailAPIView.as_view(), name='product-detail'),
    
    # Using Generic Views
    path('products/', views.ProductListCreateAPIView.as_view(), name='product-list'),
    path('products/<slug:slug>/', views.ProductDetailAPIView.as_view(), name='product-detail'),
]

# myproject/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
]
```

### Router (Recommended for ViewSets)

```python
# products/urls.py
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'categories', views.CategoryViewSet, basename='category')

urlpatterns = router.urls

# myproject/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
]
```

**Router automatically creates:**
```
GET    /api/products/                  - list
POST   /api/products/                  - create
GET    /api/products/{slug}/           - retrieve
PUT    /api/products/{slug}/           - update
PATCH  /api/products/{slug}/           - partial_update
DELETE /api/products/{slug}/           - destroy
GET    /api/products/active/           - custom action
POST   /api/products/{slug}/activate/  - custom action
```

---

## Authentication

### Token Authentication

**Each user has a unique token for API access.**

#### Step 1: Setup

```python
# settings.py
INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework.authtoken',  # Add this
    ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# Run migration
# python manage.py migrate
```

#### Step 2: Create Tokens

```python
# Create tokens for existing users
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

for user in User.objects.all():
    Token.objects.get_or_create(user=user)
```

#### Step 3: Login Endpoint

```python
# products/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login endpoint
    POST /api/login/
    {
        "username": "john",
        "password": "password123"
    }
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username
        })
    
    return Response(
        {'error': 'Invalid credentials'},
        status=400
    )

@api_view(['POST'])
def logout(request):
    """
    Logout endpoint
    POST /api/logout/
    """
    request.user.auth_token.delete()
    return Response({'message': 'Successfully logged out'})
```

#### Step 4: Use Token in Requests

```bash
# In API requests, include token in header
curl -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
     http://localhost:8000/api/products/
```

```javascript
// In JavaScript
fetch('http://localhost:8000/api/products/', {
    headers: {
        'Authorization': 'Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b'
    }
})
```

### JWT Authentication (JSON Web Tokens)

**More secure, includes expiration.**

#### Step 1: Install

```bash
pip install djangorestframework-simplejwt
```

#### Step 2: Setup

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

#### Step 3: URLs

```python
# myproject/urls.py
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

#### Step 4: Get Tokens

```bash
# Get access and refresh tokens
POST /api/token/
{
    "username": "john",
    "password": "password123"
}

Response:
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

# Use access token in requests
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

# Refresh access token when expired
POST /api/token/refresh/
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Permissions

**Control who can access what.**

### Built-in Permissions

```python
from rest_framework.permissions import (
    AllowAny,              # Anyone (including anonymous)
    IsAuthenticated,       # Must be logged in
    IsAdminUser,          # Must be staff/admin
    IsAuthenticatedOrReadOnly,  # Read by anyone, write requires auth
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
```

### Custom Permissions

```python
# products/permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Only owner can edit
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for anyone (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for owner
        return obj.created_by == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Only admin can write
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

# Use in views
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
```

### Permission Per Action

```python
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        """Different permissions for different actions"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        elif self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return super().get_permissions()
```

---

## Filtering & Searching

### Install django-filter

```bash
pip install django-filter
```

### Setup

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
```

### Simple Filtering

```python
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
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']  # Default ordering

# API Usage:
# /api/products/?category=1
# /api/products/?is_active=true
# /api/products/?search=laptop
# /api/products/?ordering=-price
# /api/products/?category=1&search=laptop&ordering=price
```

### Advanced Filtering

```python
# products/filters.py
from django_filters import rest_framework as filters
from .models import Product

class ProductFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = filters.CharFilter(field_name='category__slug', lookup_expr='exact')
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    
    class Meta:
        model = Product
        fields = ['is_active']

# products/views.py
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filterset_class = ProductFilter

# API Usage:
# /api/products/?name=laptop
# /api/products/?min_price=100&max_price=500
# /api/products/?category=electronics
# /api/products/?created_after=2024-01-01
```

---

## Pagination

### Setup Pagination

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

### Custom Pagination

```python
# products/pagination.py
from rest_framework.pagination import PageNumberPagination

class StandardResultsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class LargeResultsPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

# products/views.py
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = StandardResultsPagination

# API Usage:
# /api/products/                    - First page (10 items)
# /api/products/?page=2             - Second page
# /api/products/?page_size=25       - 25 items per page
```

### Response Format

```json
{
    "count": 100,
    "next": "http://api.example.com/products/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Product 1",
            "price": "99.99"
        },
        ...
    ]
}
```

---

## Throttling (Rate Limiting)

**Limit number of requests per user/IP.**

### Setup

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',   # Anonymous users: 100 requests/day
        'user': '1000/day',  # Authenticated users: 1000 requests/day
    }
}
```

### Custom Throttle

```python
# products/throttles.py
from rest_framework.throttling import UserRateThrottle

class BurstRateThrottle(UserRateThottle):
    rate = '60/min'  # 60 requests per minute

class SustainedRateThrottle(UserRateThrottle):
    rate = '1000/day'  # 1000 requests per day

# products/views.py
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    throttle_classes = [BurstRateThrottle, SustainedRateThrottle]
```

---

## Versioning

**Allow different API versions.**

### Setup

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.URLPathVersioning',
    'DEFAULT_VERSION': 'v1',
    'ALLOWED_VERSIONS': ['v1', 'v2'],
    'VERSION_PARAM': 'version'
}

# urls.py
urlpatterns = [
    path('api/<str:version>/', include('products.urls')),
]

# API Usage:
# /api/v1/products/
# /api/v2/products/
```

### Different Serializers Per Version

```python
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    
    def get_serializer_class(self):
        if self.request.version == 'v1':
            return ProductSerializerV1
        elif self.request.version == 'v2':
            return ProductSerializerV2
        return ProductSerializer
```

---

## Testing

### Test API Endpoints

```python
# products/tests.py
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Product, Category

class ProductAPITest(APITestCase):
    def setUp(self):
        """Run before each test"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product',
            slug='test-product',
            description='Test description',
            price=99.99,
            stock=10,
            category=self.category,
            created_by=self.user
        )
    
    def test_get_products_list(self):
        """Test GET /api/products/"""
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_get_product_detail(self):
        """Test GET /api/products/{slug}/"""
        response = self.client.get(f'/api/products/{self.product.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Product')
    
    def test_create_product_unauthenticated(self):
        """Test creating product without authentication fails"""
        data = {
            'name': 'New Product',
            'slug': 'new-product',
            'description': 'Description',
            'price': 150.00,
            'stock': 5,
            'category': self.category.id
        }
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_product_authenticated(self):
        """Test creating product with authentication"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'name': 'New Product',
            'slug': 'new-product',
            'description': 'Description',
            'price': 150.00,
            'stock': 5,
            'category': self.category.id
        }
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)
    
    def test_update_product(self):
        """Test PATCH /api/products/{slug}/"""
        self.client.force_authenticate(user=self.user)
        
        data = {'price': 120.00}
        response = self.client.patch(
            f'/api/products/{self.product.slug}/',
            data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.product.refresh_from_db()
        self.assertEqual(float(self.product.price), 120.00)
    
    def test_delete_product(self):
        """Test DELETE /api/products/{slug}/"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(f'/api/products/{self.product.slug}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)

# Run tests
# python manage.py test
```

---

## Documentation

### Swagger/OpenAPI

**Auto-generate interactive API documentation.**

#### Install

```bash
pip install drf-yasg
```

#### Setup

```python
# settings.py
INSTALLED_APPS = [
    ...
    'drf_yasg',
]

# urls.py
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Products API",
        default_version='v1',
        description="API for managing products",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
    
    # Swagger documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
```

#### Access Documentation

```
http://localhost:8000/swagger/  - Swagger UI
http://localhost:8000/redoc/    - ReDoc UI
```

---

## Best Practices

### 1. Use ViewSets with Routers

```python
# ✅ GOOD: Clean, automatic URLs
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

router = DefaultRouter()
router.register('products', ProductViewSet)
```

### 2. Optimize Queries

```python
# ✅ GOOD: Use select_related and prefetch_related
class ProductViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Product.objects.select_related('category').prefetch_related('tags')
```

### 3. Use Different Serializers

```python
# ✅ GOOD: List vs Detail serializers
def get_serializer_class(self):
    if self.action == 'list':
        return ProductListSerializer  # Minimal data
    return ProductDetailSerializer  # Full data
```

### 4. Validate Input

```python
# ✅ GOOD: Proper validation
class ProductSerializer(serializers.ModelSerializer):
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive")
        return value
```

### 5. Use Pagination

```python
# ✅ GOOD: Always paginate
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}
```

### 6. Implement Rate Limiting

```python
# ✅ GOOD: Prevent abuse
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
    }
}
```

### 7. Use Proper HTTP Status Codes

```python
# ✅ GOOD
return Response(data, status=status.HTTP_200_OK)        # Success
return Response(data, status=status.HTTP_201_CREATED)   # Created
return Response(status=status.HTTP_204_NO_CONTENT)      # Deleted
return Response(errors, status=status.HTTP_400_BAD_REQUEST)
```

### 8. Document Your API

```python
# ✅ GOOD: Add docstrings
class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing products.
    
    list: Return list of all products
    create: Create a new product
    retrieve: Return product details
    update: Update a product
    destroy: Delete a product
    """
```

### 9. Version Your API

```python
# ✅ GOOD: Plan for changes
REST_FRAMEWORK = {
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.URLPathVersioning',
}
```

### 10. Test Your API

```python
# ✅ GOOD: Write tests
class ProductAPITest(APITestCase):
    def test_create_product(self):
        # Test code
        pass
```

---

## Complete Example

### Project Structure

```
myproject/
├── myproject/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── products/
│   ├── __init__.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── permissions.py
│   ├── pagination.py
│   ├── filters.py
│   └── tests.py
├── manage.py
└── requirements.txt
```

### requirements.txt

```
Django==5.0.1
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
django-filter==23.5
drf-yasg==1.21.7
```

### Complete API Example

```python
# products/models.py
from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "categories"
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

# products/serializers.py
from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'product_count', 'created_at']
        read_only_fields = ['created_at']

class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'stock', 'category_name', 'is_active']

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive")
        return value

# products/views.py
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category
from .serializers import ProductListSerializer, ProductDetailSerializer, CategorySerializer
from .permissions import IsOwnerOrReadOnly

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Product.objects.select_related('category', 'created_by')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        active_products = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_products, many=True)
        return Response(serializer.data)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

# products/urls.py
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('categories', CategoryViewSet)

urlpatterns = router.urls

# myproject/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

This is a complete, production-ready Django REST API! 🚀