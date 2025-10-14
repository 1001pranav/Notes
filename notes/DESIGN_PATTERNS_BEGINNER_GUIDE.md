# Django Complete Guide - From Beginner to Expert

## Table of Contents
1. [Project Setup](#project-setup)
   1.1 [Creating a Django Project](#creating-a-django-project)
   1.2 [Project Structure Explained](#project-structure-explained)
   1.3 [Settings.py Configuration](#settingspy-configuration)
2. [Models](#models)
   2.1 [What are Models?](#what-are-models)
   2.2 [Basic Model Example](#basic-model-example)
   2.3 [Understanding Meta Class](#understanding-meta-class)
   2.4 [Field Types Explained](#field-types-explained)
   2.5 [Relationships Between Models](#relationships-between-models)
   2.6 [Field Options Explained](#field-options-explained)
   2.7 [Custom Model Methods](#custom-model-methods)
3. [QuerySets & Database Queries](#querysets)
   3.1 [What is a QuerySet?](#what-is-a-queryset)
   3.2 [Basic Queries](#basic-queries)
   3.3 [Field Lookups (Operators)](#field-lookups-operators)
   3.4 [Complex Queries with Q Objects](#complex-queries-with-q-objects)
   3.5 [Understanding select_related vs prefetch_related](#understanding-select_related-vs-prefetch_related)
   3.6 [F Expressions](#f-expressions)
   3.7 [Aggregation](#aggregation)
   3.8 [Ordering](#ordering)
   3.9 [Limiting Results](#limiting-results)
   3.10 [Only/Defer: Select Specific Fields](#onlydefer-select-specific-fields)
   3.11 [Bulk Operations](#bulk-operations)
   3.12 [Database Transactions](#database-transactions)
4. [Views](#views)
   4.1 [What are Views?](#what-are-views)
   4.2 [Function-Based Views (FBV)](#function-based-views-fbv)
   4.3 [Class-Based Views (CBV)](#class-based-views-cbv)
   4.4 [REST Framework Views (API)](#rest-framework-views-api)
5. [URLs](#urls)
   5.1 [What are URLs?](#what-are-urls)
   5.2 [URL Patterns](#url-patterns)
   5.3 [Including App URLs in Project](#including-app-urls-in-project)
   5.4 [URL Types](#url-types)
   5.5 [REST Framework Router](#rest-framework-router)
6. [Forms](#forms)
   6.1 [What are Forms?](#what-are-forms)
   6.2 [Django Forms (Not Connected to Model)](#django-forms-not-connected-to-model)
   6.3 [ModelForms (Connected to Model)](#modelforms-connected-to-model)
   6.4 [Form Rendering in Templates](#form-rendering-in-templates)
7. [Serializers (REST API)](#serializers)
   7.1 [What are Serializers?](#what-are-serializers)
   7.2 [Basic Serializer](#basic-serializer)
   7.3 [SerializerMethodField](#serializermethodfield)
   7.4 [Nested Serializers](#nested-serializers)
   7.5 [Different Serializers for Different Actions](#different-serializers-for-different-actions)
8. [Authentication](#authentication)
   8.1 [What is Authentication?](#what-is-authentication)
   8.2 [Django Built-in Authentication](#django-built-in-authentication)
   8.3 [REST Framework Authentication](#rest-framework-authentication)
   8.4 [JWT Authentication (More Advanced)](#jwt-authentication-more-advanced)
   8.5 [Permissions](#permissions)
   8.6 [Custom User Model](#custom-user-model)
9. [Middleware](#middleware)
   9.1 [What is Middleware?](#what-is-middleware)
   9.2 [Creating Custom Middleware](#creating-custom-middleware)
   9.3 [Registering Middleware](#registering-middleware)
   9.4 [Middleware with process_exception](#middleware-with-process_exception)
10. [Caching](#caching)
    10.1 [What is Caching?](#what-is-caching)
    10.2 [Setting Up Cache](#setting-up-cache)
    10.3 [View Caching](#view-caching)
    10.4 [Low-Level Cache API](#low-level-cache-api)
    10.5 [Template Fragment Caching](#template-fragment-caching)
    10.6 [Cache Invalidation](#cache-invalidation)
11. [Signals](#signals)
    11.1 [What are Signals?](#what-are-signals)
    11.2 [Common Built-in Signals](#common-built-in-signals)
    11.3 [Creating Signal Receivers](#creating-signal-receivers)
    11.4 [Registering Signals](#registering-signals)
    11.5 [Custom Signals](#custom-signals)
    11.6 [When NOT to Use Signals](#when-not-to-use-signals)
12. [Testing](#testing)
    12.1 [Why Test?](#why-test)
    12.2 [Types of Tests](#types-of-tests)
    12.3 [Writing Tests](#writing-tests)
    12.4 [Running Tests](#running-tests)
    12.5 [Test Coverage](#test-coverage)
13. [Async Tasks](#async-tasks)
    13.1 [What is Celery?](#what-is-celery)
    13.2 [Setup](#setup)
    13.3 [Creating Tasks](#creating-tasks)
    13.4 [Using Tasks](#using-tasks)
    13.5 [Periodic Tasks (Cron Jobs)](#periodic-tasks-cron-jobs)
    13.6 [Running Celery](#running-celery)
14. [Security](#security)
    14.1 [Essential Security Settings](#essential-security-settings)
    14.2 [SQL Injection Prevention](#sql-injection-prevention)
    14.3 [XSS (Cross-Site Scripting) Prevention](#xss-cross-site-scripting-prevention)
    14.4 [CSRF Protection](#csrf-protection)
    14.5 [Input Validation](#input-validation)
    14.6 [File Upload Security](#file-upload-security)
    14.7 [Rate Limiting (DRF)](#rate-limiting-drf)
    14.8 [Environment Variables](#environment-variables)
15. [Performance](#performance)
    15.1 [Database Query Optimization](#database-query-optimization)
    15.2 [Database Indexes](#database-indexes)
    15.3 [Caching Strategies](#caching-strategies)
    15.4 [Connection Pooling](#connection-pooling)
    15.5 [Pagination](#pagination)
    15.6 [Monitoring Query Performance](#monitoring-query-performance)
16. [Management Commands](#management-commands)
    16.1 [What are Management Commands?](#what-are-management-commands)
    16.2 [Creating a Command](#creating-a-command)
    16.3 [More Command Examples](#more-command-examples)
17. [Additional Important Topics](#additional-important-topics)
    17.1 [Admin Customization](#admin-customization)
    17.2 [Pagination Deep Dive](#pagination-deep-dive)
    17.3 [File Handling](#file-handling)
    17.4 [Custom Template Tags & Filters](#custom-template-tags--filters)
    17.5 [Sending Emails](#sending-emails)
18. [Common Patterns & Best Practices](#common-patterns--best-practices)
    18.1 [Abstract Base Models](#abstract-base-models)
    18.2 [Slug Auto-Generation](#slug-auto-generation)
    18.3 [Service Layer Pattern](#service-layer-pattern)
    18.4 [Environment-Specific Settings](#environment-specific-settings)
19. [Quick Reference](#quick-reference)
    19.1 [Django Shell Commands](#django-shell-commands)
    19.2 [Common manage.py Commands](#common-managepy-commands)
    19.3 [Useful Packages](#useful-packages)
20. [Summary](#summary)
    20.1 [Topics Covered](#topics-covered)
    20.2 [Key Principles](#key-principles)

---

## Project Setup

### Creating a Django Project

**Why?** A project is the entire application, while apps are modules within it. This structure keeps code organized and reusable.

```bash
# Install Django
pip install django

# Create a new project
django-admin startproject myproject

# Create an app within the project
python manage.py startapp products
```

### Project Structure Explained

```
myproject/
├── manage.py              # Command-line utility to interact with Django
├── myproject/             # Main project package
│   ├── settings.py        # All configuration (database, apps, security)
│   ├── urls.py           # URL routing for entire project
│   ├── wsgi.py           # For deploying with WSGI servers
│   └── asgi.py           # For async/websocket support
└── products/             # Your app
    ├── models.py         # Database models (tables)
    ├── views.py          # Request handlers (controllers)
    ├── admin.py          # Admin interface configuration
    ├── apps.py           # App configuration
    └── tests.py          # Test cases
```

### Settings.py Configuration

**Why?** This file controls everything about your Django project - which apps are active, database connections, security settings, etc.

```python
# settings.py

# INSTALLED_APPS: Tells Django which apps to load
# Why? Django only knows about apps you explicitly register here
INSTALLED_APPS = [
    # Django's built-in apps
    'django.contrib.admin',        # Admin interface at /admin
    'django.contrib.auth',         # User authentication system
    'django.contrib.contenttypes', # Tracks models in your project
    'django.contrib.sessions',     # Session management
    'django.contrib.messages',     # One-time notification messages
    'django.contrib.staticfiles',  # Serves CSS, JS, images
    
    # Third-party apps
    'rest_framework',              # For building APIs
    
    # Your apps
    'products',                    # Must add your app here!
]

# DATABASES: How Django connects to your database
# Why? Django needs to know where to store and retrieve data
DATABASES = {
    'default': {
        # SQLite (simple, file-based - good for development)
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
        
        # PostgreSQL (production-ready)
        # 'ENGINE': 'django.db.backends.postgresql',
        # 'NAME': 'mydatabase',
        # 'USER': 'myuser',
        # 'PASSWORD': 'mypassword',
        # 'HOST': 'localhost',
        # 'PORT': '5432',
    }
}

# MIDDLEWARE: Functions that process every request/response
# Why? Adds functionality like security, sessions, authentication
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',      # Security headers
    'django.contrib.sessions.middleware.SessionMiddleware', # Session support
    'django.middleware.common.CommonMiddleware',          # Common features
    'django.middleware.csrf.CsrfViewMiddleware',         # CSRF protection
    'django.contrib.auth.middleware.AuthenticationMiddleware', # User auth
    'django.contrib.messages.middleware.MessageMiddleware',    # Flash messages
]

# STATIC FILES: CSS, JavaScript, Images
# Why? Tells Django where to find and serve static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# MEDIA FILES: User-uploaded content
# Why? Separates user uploads from static files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

---

## Models

### What are Models?

**Models define your database structure using Python classes.** Each model is a database table, and each attribute is a column.

**Why use models instead of raw SQL?**
- Write Python instead of SQL
- Database-agnostic (works with PostgreSQL, MySQL, SQLite, etc.)
- Automatic migrations
- Built-in validation
- Relationships handled automatically

### Basic Model Example

```python
from django.db import models

# Each model = one database table
class Product(models.Model):
    # Each field = one column in the database
    
    # CharField: Text with max length
    # Why? For short text like names, titles
    name = models.CharField(max_length=200)
    
    # TextField: Unlimited text
    # Why? For long content like descriptions, articles
    description = models.TextField()
    
    # DecimalField: For money/precise numbers
    # Why? FloatField can lose precision; DecimalField is exact
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # IntegerField: Whole numbers
    stock = models.IntegerField(default=0)
    
    # BooleanField: True/False
    # Why? For yes/no flags like is_active, is_featured
    available = models.BooleanField(default=True)
    
    # DateTimeField: Date and time
    # auto_now_add=True: Set once when created (never changes)
    # Why? Track when records were created
    created_at = models.DateTimeField(auto_now_add=True)
    
    # auto_now=True: Update every time record is saved
    # Why? Track last modification
    updated_at = models.DateTimeField(auto_now=True)
    
    # __str__ method: How the object displays as text
    # Why? Shows readable name in admin, shell, and logs
    def __str__(self):
        return self.name
```

### Understanding Meta Class

**The Meta class provides extra information about your model.**

**Why use Meta?**
- Control database table name
- Set default ordering
- Add database indexes for performance
- Define unique constraints
- Set permissions

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Custom table name (default would be 'appname_product')
        # Why? Match existing database or follow naming conventions
        db_table = 'products'
        
        # Default ordering for queries
        # Why? Always get products newest-first without specifying order_by()
        ordering = ['-created_at']  # '-' means descending
        
        # Human-readable names
        # Why? Shows nicely in admin interface
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        
        # Database indexes for faster queries
        # Why? Makes searching by these fields much faster
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['price', 'created_at']),
        ]
        
        # Constraints: Rules enforced at database level
        # Why? Data integrity - prevent invalid data from being saved
        constraints = [
            # Price must be positive
            models.CheckConstraint(
                check=models.Q(price__gte=0),
                name='price_must_be_positive'
            ),
            # Combination of fields must be unique
            models.UniqueConstraint(
                fields=['name', 'category'],
                name='unique_product_per_category'
            )
        ]
```

### Field Types Explained

```python
class Product(models.Model):
    # Text Fields
    name = models.CharField(max_length=100)      # Short text with limit
    description = models.TextField()              # Long text, no limit
    slug = models.SlugField(unique=True)         # URL-friendly text (my-product)
    
    # Number Fields
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Money
    rating = models.IntegerField()                                 # Whole numbers
    discount = models.FloatField()                                # Decimals (less precise)
    
    # Boolean
    available = models.BooleanField(default=True)  # True/False
    
    # Date/Time
    created_at = models.DateTimeField(auto_now_add=True)  # Date + Time
    publish_date = models.DateField()                     # Date only
    sale_time = models.TimeField()                        # Time only
    
    # Files
    # Why? Django handles file uploads and storage automatically
    image = models.ImageField(upload_to='products/')      # Images
    document = models.FileField(upload_to='documents/')   # Any file
    
    # JSON Field (PostgreSQL)
    # Why? Store flexible data without creating new columns
    metadata = models.JSONField(default=dict)
    
    # URL
    website = models.URLField()  # Validates URL format
    
    # Email
    email = models.EmailField()  # Validates email format
```

### Relationships Between Models

**Why relationships?** Real-world data is connected. Products belong to categories, orders contain products, users write reviews.

#### ForeignKey (Many-to-One)

**Use when: Many items relate to one item**
Example: Many products → One category

```python
class Category(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    
    # ForeignKey: This product belongs to ONE category
    # Why? Links products to categories
    category = models.ForeignKey(
        Category,                    # Model to link to
        on_delete=models.CASCADE,    # What happens if category is deleted?
        related_name='products'      # Access category's products: category.products.all()
    )
    
    def __str__(self):
        return self.name

# on_delete options explained:
# CASCADE: Delete products when category is deleted
# PROTECT: Prevent category deletion if it has products
# SET_NULL: Set product.category to NULL (need null=True)
# SET_DEFAULT: Set to default value (need default=...)
```

**Usage:**
```python
# Get product's category
product = Product.objects.get(id=1)
print(product.category.name)  # "Electronics"

# Get all products in a category (reverse relationship)
category = Category.objects.get(id=1)
products = category.products.all()  # Uses related_name='products'
```

#### ManyToManyField

**Use when: Many items relate to many items**
Example: Products have multiple tags, tags apply to multiple products

```python
class Tag(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    
    # ManyToManyField: This product can have MANY tags
    # and each tag can apply to MANY products
    # Why? Flexible categorization without duplication
    tags = models.ManyToManyField(Tag, related_name='products')
    
    def __str__(self):
        return self.name
```

**Usage:**
```python
# Add tags to product
product = Product.objects.get(id=1)
tag1 = Tag.objects.get(name='New')
tag2 = Tag.objects.get(name='Featured')

product.tags.add(tag1, tag2)

# Get all tags for a product
product_tags = product.tags.all()

# Get all products with a specific tag
tag = Tag.objects.get(name='Featured')
featured_products = tag.products.all()

# Remove a tag
product.tags.remove(tag1)

# Clear all tags
product.tags.clear()
```

#### OneToOneField

**Use when: One item relates to exactly one other item**
Example: User has one profile

```python
from django.contrib.auth.models import User

class UserProfile(models.Model):
    # OneToOne: Each user has ONE profile, each profile has ONE user
    # Why? Extend user model with custom fields without modifying it
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    bio = models.TextField()
    date_of_birth = models.DateField()
    
    def __str__(self):
        return f"{self.user.username}'s profile"
```

**Usage:**
```python
# Access profile from user
user = User.objects.get(username='john')
print(user.profile.bio)

# Access user from profile
profile = UserProfile.objects.get(id=1)
print(profile.user.username)
```

### Field Options Explained

```python
class Product(models.Model):
    # null=True: Database allows NULL values
    # Why? Optional fields that can be empty
    description = models.TextField(null=True)
    
    # blank=True: Django forms allow empty values
    # Why? Field is optional in forms
    # Note: Use both null=True and blank=True for optional fields
    subtitle = models.CharField(max_length=200, null=True, blank=True)
    
    # default: Value if nothing provided
    # Why? Set sensible defaults
    available = models.BooleanField(default=True)
    stock = models.IntegerField(default=0)
    
    # unique=True: Value must be unique across all records
    # Why? Prevent duplicates (like email, username, slug)
    slug = models.SlugField(unique=True)
    
    # db_index=True: Create database index
    # Why? Faster searches on this field
    sku = models.CharField(max_length=50, db_index=True)
    
    # choices: Limit to specific values
    # Why? Ensure data consistency (like status, size, color)
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # editable=False: Can't be changed in forms/admin
    # Why? For fields that should only be set programmatically
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
```

### Custom Model Methods

**Why custom methods?** Add business logic to your models for reusability and cleaner code.

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.IntegerField(default=0)  # Percentage
    stock = models.IntegerField(default=0)
    
    # Property: Acts like a field but calculated
    # Why? Computed values that don't need database storage
    @property
    def discounted_price(self):
        """Calculate price after discount"""
        return self.price * (1 - self.discount / 100)
    
    @property
    def is_in_stock(self):
        """Check if product is available"""
        return self.stock > 0
    
    # Regular method
    def apply_discount(self, percentage):
        """Apply a discount to the product"""
        self.discount = percentage
        self.save()
    
    # get_absolute_url: Standard method for object's URL
    # Why? Django uses this in templates and redirects
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('product_detail', args=[self.slug])
    
    # Override save: Custom logic when saving
    # Why? Auto-generate fields, validation, side effects
    def save(self, *args, **kwargs):
        # Auto-generate slug from name
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        
        # Call parent save method
        super().save(*args, **kwargs)
```

---

## QuerySets & Database Queries

### What is a QuerySet?

**A QuerySet is a collection of database queries.** It's lazy - doesn't hit the database until you actually need the data.

**Why lazy?** Performance! You can chain filters, and Django combines them into one efficient SQL query.

### Basic Queries

```python
# Get all records
# Why? Retrieve everything from a table
products = Product.objects.all()

# Filter: Get records matching conditions
# Why? Find specific records
active_products = Product.objects.filter(available=True)
expensive = Product.objects.filter(price__gt=100)  # price > 100

# Exclude: Get records NOT matching conditions
# Why? Opposite of filter
in_stock = Product.objects.exclude(stock=0)

# Get: Get one record (raises error if not found or multiple)
# Why? When you expect exactly one result
product = Product.objects.get(id=1)
product = Product.objects.get(slug='my-product')

# First/Last: Get first or last record
# Why? Quick access to edge cases
newest = Product.objects.first()
oldest = Product.objects.last()

# Exists: Check if any records match
# Why? More efficient than counting
has_products = Product.objects.filter(category_id=1).exists()

# Count: How many records
# Why? Get total without loading all data
total = Product.objects.count()
```

### Field Lookups (Operators)

```python
# Exact match (default)
Product.objects.filter(price=100)
Product.objects.filter(price__exact=100)  # Same

# Greater than / Less than
Product.objects.filter(price__gt=100)   # Greater than
Product.objects.filter(price__gte=100)  # Greater than or equal
Product.objects.filter(price__lt=100)   # Less than
Product.objects.filter(price__lte=100)  # Less than or equal

# Contains (case-sensitive)
# Why? Search for text within a field
Product.objects.filter(name__contains='phone')

# icontains (case-insensitive)
# Why? User-friendly search
Product.objects.filter(name__icontains='PHONE')  # Finds "phone", "Phone", "iPhone"

# Starts with / Ends with
Product.objects.filter(name__startswith='iPhone')
Product.objects.filter(name__endswith='Pro')

# In: Match any value in a list
# Why? Check multiple values at once
Product.objects.filter(id__in=[1, 2, 3])
Product.objects.filter(category__in=['Electronics', 'Books'])

# Range: Between two values
# Why? Date ranges, price ranges
from datetime import date
Product.objects.filter(created_at__range=[date(2024, 1, 1), date(2024, 12, 31)])

# Is null
Product.objects.filter(description__isnull=True)  # No description
Product.objects.filter(description__isnull=False) # Has description

# Date lookups
Product.objects.filter(created_at__year=2024)
Product.objects.filter(created_at__month=12)
Product.objects.filter(created_at__day=25)
```

### Complex Queries with Q Objects

**Q objects let you build complex queries with OR, AND, NOT logic.**

**Why?** `filter()` only does AND. Q objects give you full flexibility.

```python
from django.db.models import Q

# OR: Match if ANY condition is true
# Find products named "iPhone" OR in Electronics category
products = Product.objects.filter(
    Q(name__icontains='iPhone') | Q(category__name='Electronics')
)

# AND: Match if ALL conditions are true (same as regular filter)
products = Product.objects.filter(
    Q(price__gte=100) & Q(price__lte=500)
)

# NOT: Exclude condition
products = Product.objects.filter(
    ~Q(category__name='Books')  # Everything except Books
)

# Complex combinations
# (name contains "phone" OR "tablet") AND price < 1000
products = Product.objects.filter(
    (Q(name__icontains='phone') | Q(name__icontains='tablet')) & Q(price__lt=1000)
)
```

### Understanding select_related vs prefetch_related

**These optimize database queries by reducing the number of database hits.**

#### select_related (for ForeignKey and OneToOne)

**What it does:** Uses SQL JOIN to fetch related objects in a single query.

**Why use it?** Prevents N+1 query problem.

```python
# BAD: Without select_related (N+1 queries)
# 1 query to get products + 1 query per product to get category = 101 queries!
products = Product.objects.all()
for product in products:
    print(product.category.name)  # Each triggers a new query!

# GOOD: With select_related (1 query)
# Uses SQL JOIN to get products and categories together
products = Product.objects.select_related('category').all()
for product in products:
    print(product.category.name)  # No additional query!

# Multiple relationships
products = Product.objects.select_related('category', 'created_by').all()

# Nested relationships
reviews = Review.objects.select_related('product__category').all()
```

#### prefetch_related (for ManyToMany and Reverse ForeignKey)

**What it does:** Performs separate queries and joins them in Python.

**Why use it?** Can't use SQL JOIN for ManyToMany, but still better than N+1.

```python
# BAD: Without prefetch_related
products = Product.objects.all()
for product in products:
    print(product.tags.all())  # Query for each product!

# GOOD: With prefetch_related (2 queries total)
# Query 1: Get all products
# Query 2: Get all related tags
# Python joins them together
products = Product.objects.prefetch_related('tags').all()
for product in products:
    print(product.tags.all())  # No additional query!

# Custom prefetch: Filter related objects
from django.db.models import Prefetch

products = Product.objects.prefetch_related(
    Prefetch(
        'reviews',
        queryset=Review.objects.filter(rating__gte=4)
    )
)
```

### F Expressions

**F objects reference database field values directly.**

**Why?** Avoid race conditions, perform database-level operations, compare fields.

```python
from django.db.models import F

# Compare two fields in the same record
# Find products where stock is less than reserved
low_stock = Product.objects.filter(stock__lt=F('reserved_stock'))

# Update based on current value
# Increase all prices by 10% AT DATABASE LEVEL
Product.objects.update(price=F('price') * 1.1)

# Why F() instead of Python?
# BAD: Race condition possible
product = Product.objects.get(id=1)
product.views = product.views + 1  # Another request might update in between
product.save()

# GOOD: Atomic operation at database
Product.objects.filter(id=1).update(views=F('views') + 1)
```

### Aggregation

**Aggregate performs calculations across multiple records.**

**Why?** Get stats like average, sum, count without loading all data.

```python
from django.db.models import Count, Sum, Avg, Max, Min

# Single value calculations
stats = Product.objects.aggregate(
    total_products=Count('id'),
    avg_price=Avg('price'),
    max_price=Max('price'),
    min_price=Min('price'),
    total_inventory_value=Sum(F('price') * F('stock'))
)
# Returns: {'total_products': 150, 'avg_price': 299.99, ...}

# Annotate: Add calculated field to each record
# Add product count to each category
categories = Category.objects.annotate(
    product_count=Count('products'),
    avg_product_price=Avg('products__price')
)

for category in categories:
    print(f"{category.name}: {category.product_count} products")
```

### Ordering

```python
# Ascending order
Product.objects.order_by('price')  # Cheapest first

# Descending order (use minus sign)
Product.objects.order_by('-price')  # Most expensive first

# Multiple fields
Product.objects.order_by('category', '-price')  # By category, then price desc

# Random order
Product.objects.order_by('?')
```

### Limiting Results

```python
# First 10 products
products = Product.objects.all()[:10]

# Skip first 10, get next 10 (pagination)
products = Product.objects.all()[10:20]

# First product (better than [0])
first = Product.objects.first()

# Last product
last = Product.objects.last()
```

### Only/Defer: Select Specific Fields

**Why?** Load only needed fields for better performance.

```python
# only(): Load ONLY these fields
# Why? When you need few fields from a model with many fields
products = Product.objects.only('name', 'price')
# Only name and price are loaded; accessing other fields triggers query

# defer(): Load EVERYTHING EXCEPT these fields
# Why? When you need most fields except a few large ones
products = Product.objects.defer('description', 'full_text')
# Everything loaded except description and full_text

# values(): Return dictionaries instead of model instances
# Why? Faster when you don't need model methods
products = Product.objects.values('name', 'price')
# Returns: [{'name': 'iPhone', 'price': 999}, ...]

# values_list(): Return tuples
products = Product.objects.values_list('name', 'price')
# Returns: [('iPhone', 999), ('iPad', 599), ...]

# flat=True: Single field as flat list
names = Product.objects.values_list('name', flat=True)
# Returns: ['iPhone', 'iPad', 'MacBook']
```

### Bulk Operations

**Why bulk operations?** Much faster than loops - one database query instead of many.

```python
# bulk_create: Insert many records at once
# Why? 100x faster than creating in a loop
products = [
    Product(name='Product 1', price=100),
    Product(name='Product 2', price=200),
    Product(name='Product 3', price=300),
]
Product.objects.bulk_create(products)

# bulk_update: Update many records
# Why? Faster than saving each individually
products = Product.objects.all()[:100]
for product in products:
    product.price *= 1.1  # Increase price by 10%

Product.objects.bulk_update(products, ['price'])

# update(): Update without loading objects
# Why? Most efficient way to update
Product.objects.filter(category__name='Electronics').update(discount=10)

# get_or_create: Get existing or create new
# Why? Avoid duplicate checking logic
product, created = Product.objects.get_or_create(
    slug='iphone-15',
    defaults={'name': 'iPhone 15', 'price': 999}
)
if created:
    print("Created new product")
else:
    print("Product already existed")

# update_or_create: Update if exists, create if not
# Why? Upsert operation
product, created = Product.objects.update_or_create(
    slug='iphone-15',
    defaults={'name': 'iPhone 15 Pro', 'price': 1099}
)
```

### Database Transactions

**Transactions ensure all-or-nothing operations.**

**Why?** Prevent partial updates if something fails (money transfers, inventory, orders).

```python
from django.db import transaction

# Atomic decorator: Entire function in one transaction
# Why? If any part fails, everything rolls back
@transaction.atomic
def transfer_stock(from_product, to_product, quantity):
    from_product.stock -= quantity
    from_product.save()
    
    to_product.stock += quantity
    to_product.save()
    # If second save fails, first save is rolled back!

# Context manager: Part of function in transaction
def process_order(order):
    # Some code here (not in transaction)
    
    with transaction.atomic():
        # This block is all-or-nothing
        order.status = 'processing'
        order.save()
        
        for item in order.items:
            item.product.stock -= item.quantity
            item.product.save()
        
        # If anything fails here, ALL changes are rolled back

# Why not always use transactions?
# - Small performance overhead
# - Locks database rows
# - Use for critical operations only
```

---

## Views

### What are Views?

**Views are Python functions or classes that handle web requests and return web responses.**

**Request Flow:** URL → View → Response (HTML, JSON, redirect, etc.)

### Function-Based Views (FBV)

**Simple functions that take a request and return a response.**

**Why use FBV?** Simple, clear, easy to understand for beginners.

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from .models import Product

# Basic view
def product_list(request):
    """Show all products"""
    # Get data from database
    products = Product.objects.all()
    
    # Render template with data
    # Why render()? Combines template + data + returns HttpResponse
    return render(request, 'products/list.html', {
        'products': products
    })

# View with URL parameter
def product_detail(request, slug):
    """Show single product"""
    # get_object_or_404: Get object or return 404 page
    # Why? Better than try/except - automatic error handling
    product = get_object_or_404(Product, slug=slug)
    
    return render(request, 'products/detail.html', {
        'product': product
    })

# Handling different HTTP methods
def create_product(request):
    """Create new product"""
    if request.method == 'POST':
        # Form submitted
        name = request.POST.get('name')
        price = request.POST.get('price')
        
        product = Product.objects.create(
            name=name,
            price=price
        )
        
        # Redirect after successful POST
        # Why? Prevent duplicate submissions if user refreshes
        return redirect('product_detail', slug=product.slug)
    
    else:
        # GET request: Show empty form
        return render(request, 'products/create.html')

# JSON response (API endpoint)
def product_api(request):
    """Return products as JSON"""
    products = Product.objects.values('id', 'name', 'price')
    
    # Why JsonResponse? Automatically converts to JSON + sets content-type
    return JsonResponse(list(products), safe=False)

# Require login
from django.contrib.auth.decorators import login_required

@login_required  # Redirects to login if not authenticated
def my_dashboard(request):
    """User dashboard"""
    return render(request, 'dashboard.html')

# Require specific HTTP method
from django.views.decorators.http import require_POST

@require_POST  # Only allow POST requests
def delete_product(request, id):
    """Delete product"""
    product = get_object_or_404(Product, id=id)
    product.delete()
    return redirect('product_list')
```

### Class-Based Views (CBV)

**Views as classes with methods for different HTTP methods.**

**Why use CBV?**
- Reusable via inheritance
- Built-in generic views for common patterns
- Cleaner code for complex views

```python
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy

# ListView: Show list of objects
# Why? Handles pagination, filtering automatically
class ProductListView(ListView):
    model = Product  # Which model to query
    template_name = 'products/list.html'  # Template to use
    context_object_name = 'products'  # Variable name in template
    paginate_by = 25  # Items per page
    
    # Customize the queryset
    def get_queryset(self):
        # Why override? Add filters, ordering, optimization
        queryset = super().get_queryset()
        
        # Optimize with select_related
        queryset = queryset.select_related('category')
        
        # Add search functionality
        search = self.request.GET.get('q')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset
    
    # Add extra context data
    def get_context_data(self, **kwargs):
        # Why? Add additional data to template
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        context['total_products'] = Product.objects.count()
        return context

# DetailView: Show single object
class ProductDetailView(DetailView):
    model = Product
    template_name = 'products/detail.html'
    context_object_name = 'product'
    
    # URL captures slug, not id
    slug_field = 'slug'  # Field in model
    slug_url_kwarg = 'slug'  # Name in URL pattern

# CreateView: Form to create new object
class ProductCreateView(CreateView):
    model = Product
    fields = ['name', 'slug', 'price', 'stock', 'category']  # Form fields
    template_name = 'products/form.html'
    success_url = reverse_lazy('product_list')  # Where to redirect after success
    
    # Customize before saving
    def form_valid(self, form):
        # Why? Add data not in form (like current user)
        form.instance.created_by = self.request.user
        return super().form_valid(form)

# UpdateView: Form to update existing object
class ProductUpdateView(UpdateView):
    model = Product
    fields = ['name', 'price', 'stock']
    template_name = 'products/form.html'
    
    # Dynamic success URL
    def get_success_url(self):
        return reverse_lazy('product_detail', kwargs={'slug': self.object.slug})

# DeleteView: Confirm and delete object
class ProductDeleteView(DeleteView):
    model = Product
    template_name = 'products/confirm_delete.html'
    success_url = reverse_lazy('product_list')

# Require login with CBV
from django.contrib.auth.mixins import LoginRequiredMixin

class ProtectedView(LoginRequiredMixin, ListView):
    login_url = '/login/'  # Where to redirect if not logged in
    model = Product
```

### REST Framework Views (API)

**Django REST Framework (DRF) views for building APIs.**

**Why DRF?**
- Automatic API browsing interface
- Serialization/deserialization
- Authentication & permissions
- Throttling (rate limiting)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# ViewSet: CRUD operations in one class
# Why? Less code for full API (list, create, retrieve, update, delete)
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer  # Converts to/from JSON
    permission_classes = [IsAuthenticated]  # Require login
    
    # Custom action: /api/products/{id}/mark_featured/
    @action(detail=True, methods=['post'])
    def mark_featured(self, request, pk=None):
        """Custom endpoint to mark product as featured"""
        product = self.get_object()
        product.is_featured = True
        product.save()
        return Response({'status': 'product marked as featured'})
    
    # Custom list action: /api/products/bestsellers/
    @action(detail=False, methods=['get'])
    def bestsellers(self, request):
        """Get best-selling products"""
        bestsellers = self.queryset.order_by('-sales_count')[:10]
        serializer = self.get_serializer(bestsellers, many=True)
        return Response(serializer.data)

# Function-based API view
@api_view(['GET', 'POST'])  # Allowed methods
def product_api(request):
    """API endpoint for products"""
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

---

## URLs & Routing

### What are URLs?

**URLs map web addresses to views.**

**Example:** `/products/iphone-15/` → `product_detail` view → Shows iPhone 15 page

### URL Patterns

```python
# products/urls.py
from django.urls import path
from . import views

# app_name: Namespacing to avoid conflicts between apps
# Why? Multiple apps might have 'detail' URL; namespace prevents confusion
app_name = 'products'

urlpatterns = [
    # Basic URL pattern
    # path('url/', view_function, name='url_name')
    path('', views.product_list, name='list'),
    
    # URL with parameter
    # <type:variable_name> captures part of URL
    path('<int:id>/', views.product_detail, name='detail'),
    path('<slug:slug>/', views.product_detail_by_slug, name='detail_slug'),
    
    # Multiple parameters
    path('category/<slug:category_slug>/product/<int:id>/', 
         views.category_product, 
         name='category_product'),
    
    # Class-based view (use .as_view())
    path('list/', views.ProductListView.as_view(), name='list_cbv'),
]

# Why use name parameter?
# Instead of hardcoding URLs, use reverse lookup:
# BAD:  <a href="/products/5/">Product</a>
# GOOD: <a href="{% url 'products:detail' 5 %}">Product</a>
# Benefits: Change URL without breaking links
```

### Including App URLs in Project

```python
# myproject/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # Include app URLs
    # Why include()? Keeps app URLs in their own file (modularity)
    path('products/', include('products.urls')),  # All products URLs start with /products/
    path('api/', include('api.urls')),
    
    # Home page
    path('', views.home, name='home'),
]
```

### URL Types

```python
# String parameter (any text)
path('search/<str:query>/', views.search)

# Integer parameter
path('product/<int:id>/', views.product)

# Slug parameter (letters, numbers, hyphens, underscores)
path('product/<slug:slug>/', views.product)

# UUID parameter
path('order/<uuid:order_id>/', views.order)

# Path parameter (captures everything including slashes)
path('file/<path:file_path>/', views.file)

# Regular expression (advanced)
from django.urls import re_path
re_path(r'^archive/(?P<year>[0-9]{4})/$', views.year_archive)
```

### REST Framework Router

**Routers automatically create URLs for ViewSets.**

**Why?** Automatic CRUD URLs following REST conventions.

```python
# api/urls.py
from rest_framework.routers import DefaultRouter
from products import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'categories', views.CategoryViewSet)

# Automatically creates these URLs:
# GET    /api/products/          - List all products
# POST   /api/products/          - Create new product
# GET    /api/products/{id}/     - Get specific product
# PUT    /api/products/{id}/     - Update product
# PATCH  /api/products/{id}/     - Partial update
# DELETE /api/products/{id}/     - Delete product

urlpatterns = router.urls
```

---

## Forms

### What are Forms?

**Forms handle user input, validation, and display.**

**Why forms?** Security (CSRF protection), validation, HTML generation.

### Django Forms (Not Connected to Model)

```python
from django import forms

class ContactForm(forms.Form):
    """Form for contact page"""
    name = forms.CharField(
        max_length=100,
        label='Your Name',  # Label shown to user
        help_text='Enter your full name'  # Help text below field
    )
    email = forms.EmailField(
        label='Email Address',
        widget=forms.EmailInput(attrs={'placeholder': 'you@example.com'})
    )
    subject = forms.CharField(max_length=200)
    message = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 5})  # Multi-line text
    )
    agree_terms = forms.BooleanField(required=True)
    
    # Custom validation for specific field
    def clean_email(self):
        """Validate email field"""
        email = self.cleaned_data['email']
        if not email.endswith('@company.com'):
            raise forms.ValidationError('Must use company email')
        return email
    
    # Validation across multiple fields
    def clean(self):
        """Validate entire form"""
        cleaned_data = super().clean()
        name = cleaned_data.get('name')
        subject = cleaned_data.get('subject')
        
        if name and subject and name.lower() in subject.lower():
            raise forms.ValidationError('Subject cannot contain your name')
        
        return cleaned_data

# Using form in view
def contact_view(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # form.cleaned_data has validated data
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            # Send email, save to database, etc.
            return redirect('success')
    else:
        form = ContactForm()
    
    return render(request, 'contact.html', {'form': form})
```

### ModelForms (Connected to Model)

**ModelForm automatically creates form from model.**

**Why ModelForm?** Less code, automatic validation matching model, easy save.

```python
from django import forms
from .models import Product

class ProductForm(forms.ModelForm):
    """Form for creating/editing products"""
    
    # Add extra fields not in model
    agree_terms = forms.BooleanField(required=True)
    
    class Meta:
        model = Product  # Which model
        
        # Which fields to include
        fields = ['name', 'slug', 'description', 'price', 'stock', 'category', 'image']
        # OR exclude certain fields
        # exclude = ['created_by', 'created_at']
        # OR all fields
        # fields = '__all__'
        
        # Custom widgets (HTML input types)
        widgets = {
            'description': forms.Textarea(attrs={
                'rows': 4,
                'class': 'form-control',  # Bootstrap class
                'placeholder': 'Enter product description'
            }),
            'price': forms.NumberInput(attrs={
                'step': '0.01',
                'min': '0'
            }),
        }
        
        # Custom labels
        labels = {
            'name': 'Product Name',
            'slug': 'URL Slug',
        }
        
        # Help text
        help_texts = {
            'slug': 'URL-friendly version (e.g., iphone-15-pro)',
        }
    
    # Customize form initialization
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Filter category choices
        # Why? Show only active categories
        self.fields['category'].queryset = Category.objects.filter(is_active=True)
        
        # Add CSS class to all fields
        for field in self.fields:
            self.fields[field].widget.attrs['class'] = 'form-control'
    
    # Field-level validation
    def clean_slug(self):
        """Ensure slug is unique"""
        slug = self.cleaned_data['slug']
        # Exclude current instance when editing
        if Product.objects.filter(slug=slug).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError('This slug already exists')
        return slug
    
    def clean_price(self):
        """Ensure price is positive"""
        price = self.cleaned_data['price']
        if price <= 0:
            raise forms.ValidationError('Price must be greater than zero')
        return price

# Using ModelForm in view
def create_product(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)  # request.FILES for file uploads
        if form.is_valid():
            # save() creates/updates model instance
            product = form.save(commit=False)  # Don't save yet
            product.created_by = request.user  # Add extra data
            product.save()  # Now save
            form.save_m2m()  # Save many-to-many relationships
            return redirect('product_detail', slug=product.slug)
    else:
        form = ProductForm()
    
    return render(request, 'products/form.html', {'form': form})

# Editing existing object
def edit_product(request, slug):
    product = get_object_or_404(Product, slug=slug)
    
    if request.method == 'POST':
        # Pass instance to edit existing object
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            return redirect('product_detail', slug=product.slug)
    else:
        # Pre-populate form with existing data
        form = ProductForm(instance=product)
    
    return render(request, 'products/form.html', {'form': form})
```

### Form Rendering in Templates

```html
<!-- Basic form rendering -->
<form method="post" enctype="multipart/form-data">
    {% csrf_token %}  <!-- Required! Prevents CSRF attacks -->
    
    <!-- Automatic rendering (quick but less control) -->
    {{ form.as_p }}  <!-- Each field in <p> tag -->
    
    <button type="submit">Submit</button>
</form>

<!-- Manual rendering (full control) -->
<form method="post">
    {% csrf_token %}
    
    <div class="form-group">
        {{ form.name.label_tag }}  <!-- <label> -->
        {{ form.name }}  <!-- <input> -->
        {{ form.name.help_text }}
        {% if form.name.errors %}
            <div class="error">{{ form.name.errors }}</div>
        {% endif %}
    </div>
    
    <button type="submit">Submit</button>
</form>

<!-- Display all form errors -->
{% if form.errors %}
    <div class="alert alert-danger">
        {{ form.errors }}
    </div>
{% endif %}
```

---

## Serializers (REST Framework)

### What are Serializers?

**Serializers convert complex data (models) to JSON and vice versa.**

**Why?** APIs need to send/receive JSON, not Python objects.

### Basic Serializer

```python
from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    """Convert Category model to/from JSON"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']  # What to include in JSON
        # OR all fields: fields = '__all__'
        # OR exclude: exclude = ['created_at']
        
        # Read-only fields (can't be changed via API)
        read_only_fields = ['id', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    """Convert Product model to/from JSON"""
    
    # Nested serializer - show full category info
    # Why? API returns complete category data, not just ID
    category = CategorySerializer(read_only=True)
    
    # Write-only field for creating/updating
    # Why? Accept category ID for input, but show full object in output
    category_id = serializers.IntegerField(write_only=True)
    
    # Add computed field
    # Why? Include calculated data in API response
    is_in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 
            'stock', 'category', 'category_id', 'is_in_stock',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    # Field-level validation
    def validate_price(self, value):
        """Ensure price is positive"""
        # Why? Validate data before saving
        if value <= 0:
            raise serializers.ValidationError("Price must be positive")
        return value
    
    # Object-level validation (multiple fields)
    def validate(self, data):
        """Validate entire object"""
        if data.get('available') and data.get('stock', 0) == 0:
            raise serializers.ValidationError(
                "Cannot mark as available with zero stock"
            )
        return data
    
    # Custom create logic
    def create(self, validated_data):
        """Called when creating new object"""
        # Why override? Add custom logic during creation
        return super().create(validated_data)
    
    # Custom update logic
    def update(self, instance, validated_data):
        """Called when updating existing object"""
        # Why override? Add custom logic during updates
        return super().update(instance, validated_data)
```

### SerializerMethodField

**Add custom calculated fields to API response.**

```python
class ProductSerializer(serializers.ModelSerializer):
    # Custom field using method
    # Why? Complex calculations, data from multiple sources
    category_name = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'category_name', 'discounted_price']
    
    def get_category_name(self, obj):
        """Method name must be get_<field_name>"""
        # obj is the Product instance
        return obj.category.name if obj.category else None
    
    def get_discounted_price(self, obj):
        """Calculate discounted price"""
        # Access context data passed from view
        discount = self.context.get('discount', 0)
        return obj.price * (1 - discount / 100)

# Pass context from view
serializer = ProductSerializer(product, context={'discount': 10})
```

### Nested Serializers

**Handle related objects in API.**

```python
class OrderItemSerializer(serializers.ModelSerializer):
    # Show product details in order items
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    # Nested items in order
    # Why? API returns complete order with all items
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'items', 'total_amount', 'created_at']
    
    def create(self, validated_data):
        """Create order with items"""
        # Extract nested data
        items_data = validated_data.pop('items')
        
        # Create order
        order = Order.objects.create(**validated_data)
        
        # Create items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order
```

### Different Serializers for Different Actions

**Why?** List view needs less detail than detail view.

```python
class ProductListSerializer(serializers.ModelSerializer):
    """Minimal data for list view"""
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image']

class ProductDetailSerializer(serializers.ModelSerializer):
    """Complete data for detail view"""
    category = CategorySerializer()
    reviews = ReviewSerializer(many=True)
    
    class Meta:
        model = Product
        fields = '__all__'

# In ViewSet
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    
    def get_serializer_class(self):
        """Choose serializer based on action"""
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer
```

---

## Authentication & Permissions

### What is Authentication?

**Authentication = Who are you? (Identity)**
**Authorization = What can you do? (Permissions)**

### Django Built-in Authentication

```python
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

# Login view
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        
        # authenticate: Check if credentials are valid
        # Why? Securely verify password hash
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # login: Create session for user
            # Why? Remember user across requests
            login(request, user)
            return redirect('home')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    
    return render(request, 'login.html')

# Logout view
def logout_view(request):
    # logout: End user session
    logout(request)
    return redirect('home')

# Protected view (requires login)
@login_required(login_url='/login/')  # Redirect to login if not authenticated
def dashboard(request):
    # request.user is the logged-in user
    return render(request, 'dashboard.html', {'user': request.user})

# Create new user
def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        
        # Create user (password is automatically hashed)
        # Why create_user()? Properly hashes password for security
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        # Log them in automatically
        login(request, user)
        return redirect('home')
    
    return render(request, 'register.html')
```

### REST Framework Authentication

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',  # Cookie-based
        'rest_framework.authentication.TokenAuthentication',    # Token-based
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Require login by default
    ],
}

# Token Authentication Setup
# Why tokens? Stateless, good for mobile apps and SPAs
INSTALLED_APPS = [
    ...
    'rest_framework.authtoken',
]

# Run migration to create token table
# python manage.py migrate

# Create token for user
from rest_framework.authtoken.models import Token
token = Token.objects.create(user=user)
print(token.key)  # Send this to client

# API authentication view
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anyone to login
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    
    return Response({'error': 'Invalid credentials'}, status=400)

# Client uses token in requests:
# Header: Authorization: Token <token_key>
```

### JWT Authentication (More Advanced)

**JWT = JSON Web Token - Self-contained token with user info.**

**Why JWT?** No database lookup needed, works across services, includes expiry.

```python
# Install: pip install djangorestframework-simplejwt

# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# urls.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Client workflow:
# 1. POST /api/token/ with username/password
#    Returns: {access: '...', refresh: '...'}
# 2. Use access token in requests: Authorization: Bearer <access_token>
# 3. When access expires, POST refresh token to /api/token/refresh/
#    Returns new access token
```

### Permissions

**Control what authenticated users can do.**

```python
from rest_framework import permissions

# Built-in permissions
# AllowAny: Anyone can access
# IsAuthenticated: Must be logged in
# IsAdminUser: Must be staff/admin
# IsAuthenticatedOrReadOnly: Read by anyone, write requires login

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        """Different permissions per action"""
        # Why? Public can view, only admin can edit
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['create', 'update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

# Custom permission
class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only owner can edit, everyone can read"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for anyone
        # Why SAFE_METHODS? GET, HEAD, OPTIONS don't change data
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for owner
        return obj.created_by == request.user

# Use custom permission
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
```

### Custom User Model

**Extend Django's User model with custom fields.**

**Why?** Add fields like phone, date_of_birth without separate profile table.

```python
# accounts/models.py
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """Custom user with additional fields"""
    # Keep all default fields (username, email, password, etc.)
    # Add custom fields
    phone = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return self.email

# settings.py
AUTH_USER_MODEL = 'accounts.CustomUser'  # Tell Django to use this instead

# Must create this BEFORE first migration!
# After: python manage.py makemigrations
#        python manage.py migrate
```

---

## Middleware

### What is Middleware?

**Middleware processes every request before it reaches views and every response before it's sent to the client.**

**Think of it as:** Request → Middleware → View → Middleware → Response

**Why middleware?**
- Add headers to all responses
- Log all requests
- Handle authentication
- Modify request/response
- Performance monitoring

### Creating Custom Middleware

```python
# middleware.py

class SimpleMiddleware:
    """Basic middleware structure"""
    
    def __init__(self, get_response):
        # One-time initialization
        # Why? Setup that happens once when server starts
        self.get_response = get_response
    
    def __call__(self, request):
        # Code executed for each request BEFORE view
        print(f"Request: {request.method} {request.path}")
        
        # Call the next middleware or view
        response = self.get_response(request)
        
        # Code executed for each request AFTER view
        print(f"Response status: {response.status_code}")
        
        return response

class RequestLoggingMiddleware:
    """Log all requests with timing"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        import time
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Record start time
        start_time = time.time()
        
        # Log request
        logger.info(f"{request.method} {request.path}")
        
        # Process request
        response = self.get_response(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log response with timing
        logger.info(f"Response {response.status_code} - {duration:.2f}s")
        
        return response

class CustomHeaderMiddleware:
    """Add custom header to all responses"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add custom header
        # Why? Add API version, rate limit info, etc.
        response['X-Custom-Header'] = 'My Value'
        response['X-Request-ID'] = str(uuid.uuid4())
        
        return response

class APIKeyAuthMiddleware:
    """Check API key for all API requests"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Only check API endpoints
        if request.path.startswith('/api/'):
            api_key = request.headers.get('X-API-Key')
            
            if not api_key or not self.is_valid_key(api_key):
                # Return 401 without calling view
                return JsonResponse(
                    {'error': 'Invalid API key'},
                    status=401
                )
        
        return self.get_response(request)
    
    def is_valid_key(self, key):
        # Check key against database
        return APIKey.objects.filter(key=key, is_active=True).exists()
```

### Registering Middleware

```python
# settings.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    
    # Add your custom middleware
    # Order matters! Processed top-to-bottom for requests, bottom-to-top for responses
    'myapp.middleware.RequestLoggingMiddleware',
    'myapp.middleware.CustomHeaderMiddleware',
]
```

### Middleware with process_exception

**Handle exceptions in one place.**

```python
class ExceptionHandlingMiddleware:
    """Catch and handle all exceptions"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        return self.get_response(request)
    
    def process_exception(self, request, exception):
        """Called when view raises exception"""
        # Why? Central error handling and logging
        import logging
        logger = logging.getLogger(__name__)
        
        logger.error(f"Exception: {exception}", exc_info=True)
        
        # Return custom error response
        return JsonResponse({
            'error': 'An error occurred',
            'message': str(exception)
        }, status=500)
```

---

## Caching

### What is Caching?

**Caching stores frequently accessed data in fast storage (like Redis) to avoid slow database queries.**

**Why cache?**
- Faster page loads
- Reduce database load
- Handle more users
- Lower server costs

**When to cache?**
- Data that doesn't change often
- Expensive database queries
- API responses
- Computed results

### Setting Up Cache

```python
# settings.py

# Redis cache (production)
# Why Redis? Fast, supports expiration, works across multiple servers
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'myapp',  # Prefix all keys
        'TIMEOUT': 300,  # Default timeout (seconds)
    }
}

# Local memory cache (development only)
# Why? Simple, no setup, but doesn't work with multiple servers
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
```

### View Caching

**Cache entire view response.**

```python
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

# Cache function-based view
# Why? Avoid running view code and queries on every request
@cache_page(60 * 15)  # Cache for 15 minutes
def product_list(request):
    """This entire view is cached"""
    products = Product.objects.all()  # Only runs once per 15 min
    return render(request, 'products/list.html', {'products': products})

# Cache class-based view
class ProductListView(ListView):
    model = Product
    
    @method_decorator(cache_page(60 * 15))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

# Cache with varying (different cache per user, language, etc.)
from django.views.decorators.vary import vary_on_cookie

@cache_page(60 * 15)
@vary_on_cookie  # Different cache for each logged-in user
def my_view(request):
    pass
```

### Low-Level Cache API

**Manually control what to cache.**

```python
from django.core.cache import cache

# Set cache value
# Why? Cache expensive computations
cache.set('my_key', 'my_value', 300)  # 300 seconds

# Get cache value
value = cache.get('my_key')
# Returns None if not found

# Get with default
value = cache.get('my_key', 'default_value')

# Get or set (get existing, or compute and cache if missing)
# Why? Common pattern to avoid checking if exists
def expensive_computation():
    # Complex calculation
    return result

value = cache.get_or_set('my_key', expensive_computation, 300)

# Delete cache
cache.delete('my_key')

# Multiple keys
cache.set_many({'key1': 'value1', 'key2': 'value2'}, 300)
values = cache.get_many(['key1', 'key2'])
cache.delete_many(['key1', 'key2'])

# Clear entire cache
cache.clear()

# Practical example: Cache database query
def get_products():
    """Get products with caching"""
    cache_key = 'all_products'
    
    # Try to get from cache
    products = cache.get(cache_key)
    
    if products is None:
        # Not in cache, query database
        products = list(Product.objects.select_related('category').all())
        
        # Store in cache for 15 minutes
        cache.set(cache_key, products, 60 * 15)
        print("From database")
    else:
        print("From cache")
    
    return products
```

### Template Fragment Caching

**Cache parts of templates.**

```html
{% load cache %}

<!-- Cache this section for 500 seconds -->
{% cache 500 sidebar %}
    <div class="sidebar">
        <!-- Expensive template code -->
        {% for category in categories %}
            <a href="{{ category.url }}">{{ category.name }}</a>
        {% endfor %}
    </div>
{% endcache %}

<!-- Cache per user -->
{% cache 500 sidebar request.user.username %}
    <!-- Different cache for each user -->
{% endcache %}
```

### Cache Invalidation

**Remove cache when data changes.**

```python
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

@receiver(post_save, sender=Product)
def product_saved(sender, instance, **kwargs):
    """Clear product cache when product is saved"""
    # Why? Ensure cached data stays up to date
    cache.delete('all_products')
    cache.delete(f'product_{instance.id}')

@receiver(post_delete, sender=Product)
def product_deleted(sender, instance, **kwargs):
    """Clear cache when product is deleted"""
    cache.delete('all_products')
    cache.delete(f'product_{instance.id}')
```

---

## Signals

### What are Signals?

**Signals let one part of your app notify other parts when something happens.**

**Think of it as:** "Hey, I just saved a Product, do whatever you need to do!"

**Why signals?**
- Decouple code (sender doesn't know about receivers)
- React to model changes
- Keep code organized
- Trigger side effects (send email, update cache, log activity)

### Common Built-in Signals

```python
from django.db.models.signals import (
    pre_save,      # Before model.save()
    post_save,     # After model.save()
    pre_delete,    # Before model.delete()
    post_delete,   # After model.delete()
    m2m_changed,   # When ManyToMany changes
)
from django.contrib.auth.signals import user_logged_in, user_logged_out
```

### Creating Signal Receivers

```python
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Product

# Decorator style (recommended)
@receiver(post_save, sender=Product)
def product_saved(sender, instance, created, **kwargs):
    """Called after Product is saved"""
    # sender = Product model
    # instance = the actual product that was saved
    # created = True if new object, False if update
    
    if created:
        print(f"New product created: {instance.name}")
        # Send notification, update search index, etc.
    else:
        print(f"Product updated: {instance.name}")
        # Clear cache
        cache.delete(f'product_{instance.id}')

@receiver(pre_delete, sender=Product)
def product_deleting(sender, instance, **kwargs):
    """Called before Product is deleted"""
    # Why pre_delete? Do cleanup before object is gone
    print(f"Deleting product: {instance.name}")
    
    # Delete associated files
    if instance.image:
        instance.image.delete(save=False)
    
    # Log deletion
    log_deletion(instance)

# ManyToMany signal
@receiver(m2m_changed, sender=Product.tags.through)
def tags_changed(sender, instance, action, **kwargs):
    """Called when product tags change"""
    # action can be: 'pre_add', 'post_add', 'pre_remove', 'post_remove', 'pre_clear', 'post_clear'
    
    if action in ['post_add', 'post_remove']:
        print(f"Tags changed for: {instance.name}")
        # Update search index, clear cache, etc.

# User login signal
@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    """Called when user logs in"""
    print(f"User logged in: {user.username}")
    # Log activity, update last login, send notification

# Manual connection (alternative to decorator)
def product_saved_handler(sender, instance, created, **kwargs):
    pass

post_save.connect(product_saved_handler, sender=Product)
```

### Registering Signals

**Where to put signal code?**

```python
# myapp/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Product)
def product_saved(sender, instance, created, **kwargs):
    pass

# myapp/apps.py
from django.apps import AppConfig

class MyAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'
    
    def ready(self):
        """Import signals when app is ready"""
        # Why here? Ensures signals are registered when Django starts
        import myapp.signals  # noqa
```

### Custom Signals

**Create your own signals for app-specific events.**

```python
# signals.py
from django.dispatch import Signal

# Define custom signal
# Why? Trigger custom events in your app
order_placed = Signal()  # No arguments

# Send signal
from .signals import order_placed

def create_order(request):
    order = Order.objects.create(...)
    
    # Send signal to notify other parts of app
    order_placed.send(
        sender=Order,
        order=order,
        user=request.user
    )

# Receive custom signal
from .signals import order_placed

@receiver(order_placed)
def handle_order_placed(sender, order, user, **kwargs):
    """React to order placement"""
    # Send confirmation email
    send_order_email(user, order)
    
    # Update inventory
    update_inventory(order)
    
    # Log for analytics
    log_order(order)
```

### When NOT to Use Signals

**Signals can make code hard to follow. Avoid when:**

1. **Simple relationships** - Just call the function directly
```python
# BAD: Using signal for simple task
@receiver(post_save, sender=Product)
def update_category_count(sender, instance, **kwargs):
    instance.category.update_product_count()

# GOOD: Call directly in save method
class Product(models.Model):
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.category.update_product_count()
```

2. **Performance-critical paths** - Signals add overhead

3. **Complex logic** - Better as explicit service functions

---

## Testing

### Why Test?

**Tests verify your code works correctly and prevent bugs.**

**Benefits:**
- Catch bugs before production
- Safe refactoring (know if you break something)
- Documentation (tests show how code should work)
- Confidence in deployments

### Types of Tests

1. **Unit Tests** - Test single function/method in isolation
2. **Integration Tests** - Test multiple components together
3. **End-to-End Tests** - Test complete user workflows

### Writing Tests

```python
# tests.py
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Product, Category

class ProductModelTest(TestCase):
    """Test Product model"""
    
    @classmethod
    def setUpTestData(cls):
        """Create data once for entire test class"""
        # Why setUpTestData? Runs once, faster than setUp
        cls.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        cls.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
    
    def setUp(self):
        """Runs before each test method"""
        # Why setUp? When tests modify data
        self.product = Product.objects.create(
            name='Test Product',
            slug='test-product',
            price=100.00,
            stock=10,
            category=self.category
        )
    
    def test_product_creation(self):
        """Test creating a product"""
        self.assertEqual(self.product.name, 'Test Product')
        self.assertEqual(self.product.price, 100.00)
        self.assertTrue(isinstance(self.product, Product))
    
    def test_str_method(self):
        """Test string representation"""
        self.assertEqual(str(self.product), 'Test Product')
    
    def test_absolute_url(self):
        """Test get_absolute_url method"""
        expected_url = '/products/test-product/'
        self.assertEqual(self.product.get_absolute_url(), expected_url)
    
    def test_is_in_stock(self):
        """Test is_in_stock property"""
        self.assertTrue(self.product.is_in_stock)
        
        # Test with no stock
        self.product.stock = 0
        self.assertFalse(self.product.is_in_stock)
    
    def test_product_with_no_category(self):
        """Test product without category"""
        product = Product.objects.create(
            name='No Category Product',
            slug='no-category',
            price=50.00
        )
        self.assertIsNone(product.category)

class ProductViewTest(TestCase):
    """Test Product views"""
    
    def setUp(self):
        self.client = Client()  # Test client for requests
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
            price=100.00,
            category=self.category
        )
    
    def test_product_list_view(self):
        """Test product list page"""
        # Make GET request
        response = self.client.get(reverse('products:list'))
        
        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Product')
        self.assertTemplateUsed(response, 'products/list.html')
    
    def test_product_detail_view(self):
        """Test product detail page"""
        url = reverse('products:detail', args=[self.product.slug])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['product'], self.product)
    
    def test_product_create_requires_login(self):
        """Test create view requires authentication"""
        response = self.client.get(reverse('products:create'))
        
        # Should redirect to login
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, '/accounts/login/?next=/products/create/')
    
    def test_product_create_authenticated(self):
        """Test creating product when logged in"""
        # Login first
        self.client.login(username='testuser', password='testpass123')
        
        # POST to create view
        response = self.client.post(reverse('products:create'), {
            'name': 'New Product',
            'slug': 'new-product',
            'price': 150.00,
            'stock': 5,
            'category': self.category.id,
        })
        
        # Should create product and redirect
        self.assertEqual(Product.objects.count(), 2)  # Was 1, now 2
        self.assertTrue(Product.objects.filter(slug='new-product').exists())
        
        # Check redirect
        new_product = Product.objects.get(slug='new-product')
        self.assertRedirects(response, new_product.get_absolute_url())
    
    def test_product_update_view(self):
        """Test updating product"""
        self.client.login(username='testuser', password='testpass123')
        
        url = reverse('products:update', args=[self.product.slug])
        response = self.client.post(url, {
            'name': 'Updated Product',
            'slug': 'test-product',
            'price': 120.00,
            'stock': 15,
            'category': self.category.id,
        })
        
        # Reload product from database
        self.product.refresh_from_db()
        
        self.assertEqual(self.product.name, 'Updated Product')
        self.assertEqual(self.product.price, 120.00)

# API Testing
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

class ProductAPITest(APITestCase):
    """Test Product API"""
    
    def setUp(self):
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
            price=100.00,
            category=self.category
        )
    
    def test_get_product_list(self):
        """Test GET /api/products/"""
        response = self.client.get('/api/products/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Product')
    
    def test_create_product_unauthenticated(self):
        """Test creating product without auth fails"""
        data = {
            'name': 'New Product',
            'slug': 'new-product',
            'price': 150.00,
            'category': self.category.id,
        }
        response = self.client.post('/api/products/', data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_product_authenticated(self):
        """Test creating product with auth"""
        # Authenticate
        self.client.force_authenticate(user=self.user)
        
        data = {
            'name': 'New Product',
            'slug': 'new-product',
            'price': 150.00,
            'stock': 5,
            'category_id': self.category.id,
        }
        response = self.client.post('/api/products/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)
        self.assertEqual(response.data['name'], 'New Product')
    
    def test_update_product(self):
        """Test PATCH /api/products/{id}/"""
        self.client.force_authenticate(user=self.user)
        
        url = f'/api/products/{self.product.id}/'
        data = {'price': 120.00}
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, 120.00)
    
    def test_delete_product(self):
        """Test DELETE /api/products/{id}/"""
        self.client.force_authenticate(user=self.user)
        
        url = f'/api/products/{self.product.id}/'
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)
```

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app
python manage.py test products

# Run specific test class
python manage.py test products.tests.ProductModelTest

# Run specific test method
python manage.py test products.tests.ProductModelTest.test_product_creation

# Keep test database (faster for repeated runs)
python manage.py test --keepdb

# Run in parallel (faster)
python manage.py test --parallel

# Verbose output
python manage.py test --verbosity 2
```

### Test Coverage

**See which code is tested.**

```bash
# Install coverage
pip install coverage

# Run tests with coverage
coverage run --source='.' manage.py test

# Show coverage report
coverage report

# Generate HTML report
coverage html
# Opens htmlcov/index.html in browser
```

---

## Async Tasks with Celery

### What is Celery?

**Celery runs tasks in the background, separate from web requests.**

**Why Celery?**
- Slow tasks don't block web responses
- Schedule periodic tasks
- Retry failed tasks
- Handle many tasks concurrently

**Use cases:**
- Send emails
- Process images
- Generate reports
- Update data from APIs
- Data cleanup

### Setup

```python
# Install
pip install celery redis

# settings.py
CELERY_BROKER_URL = 'redis://localhost:6379/0'  # Where tasks are queued
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'  # Where results are stored
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

# celery.py (in project folder, next to settings.py)
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

app = Celery('myproject')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# __init__.py (in project folder)
from .celery import app as celery_app
__all__ = ('celery_app',)
```

### Creating Tasks

```python
# tasks.py
from celery import shared_task
from django.core.mail import send_mail
from .models import Product

@shared_task
def send_email_task(subject, message, recipient_list):
    """Send email asynchronously"""
    # Why @shared_task? Works across multiple apps
    send_mail(
        subject,
        message,
        'from@example.com',
        recipient_list,
        fail_silently=False,
    )
    return f"Email sent to {len(recipient_list)} recipients"

@shared_task
def process_order(order_id):
    """Process order in background"""
    order = Order.objects.get(id=order_id)
    
    # Long-running process
    # Update inventory
    for item in order.items.all():
        item.product.stock -= item.quantity
        item.product.save()
    
    # Generate invoice
    generate_invoice(order)
    
    # Send confirmation
    send_order_confirmation(order)
    
    order.status = 'processed'
    order.save()

@shared_task(bind=True, max_retries=3)
def fetch_external_data(self, url):
    """Fetch data from external API with retry"""
    # bind=True gives access to task instance (self)
    import requests
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        # Retry after 1 minute if fails
        # Why retry? External APIs can be temporarily down
        raise self.retry(exc=exc, countdown=60)

@shared_task
def cleanup_old_records():
    """Delete old records"""
    from datetime import timedelta
    from django.utils import timezone
    
    cutoff_date = timezone.now() - timedelta(days=30)
    deleted_count = Product.objects.filter(
        is_active=False,
        updated_at__lt=cutoff_date
    ).delete()[0]
    
    return f"Deleted {deleted_count} old records"
```

### Using Tasks

```python
# views.py
from .tasks import send_email_task, process_order

def create_order(request):
    # Create order
    order = Order.objects.create(...)
    
    # Call task asynchronously
    # .delay() = shortcut for .apply_async()
    # Why? Request returns immediately, task runs in background
    process_order.delay(order.id)
    
    return JsonResponse({'message': 'Order is being processed'})

def send_welcome_email(request):
    # Call task
    result = send_email_task.delay(
        'Welcome!',
        'Thanks for joining.',
        [request.user.email]
    )
    
    # result.id = Task ID for tracking
    return JsonResponse({'task_id': result.id})
```

### Periodic Tasks (Cron Jobs)

**Schedule tasks to run automatically.**

```python
# settings.py
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'send-daily-report': {
        'task': 'products.tasks.send_daily_report',
        'schedule': crontab(hour=9, minute=0),  # Every day at 9 AM
    },
    'cleanup-every-hour': {
        'task': 'products.tasks.cleanup_old_records',
        'schedule': crontab(minute=0),  # Every hour
    },
    'backup-every-night': {
        'task': 'products.tasks.backup_database',
        'schedule': crontab(hour=2, minute=0),  # Every day at 2 AM
    },
}

# Start Celery Beat (scheduler)
# celery -A myproject beat -l info
```

### Running Celery

```bash
# Start worker (processes tasks)
celery -A myproject worker -l info

# Start beat (scheduler for periodic tasks)
celery -A myproject beat -l info

# Start both together
celery -A myproject worker --beat -l info

# Multiple workers (for more concurrency)
celery -A myproject worker --concurrency=4

# Production: Use supervisor or systemd to keep Celery running
```

---

## Security

### Essential Security Settings

```python
# settings.py

# PRODUCTION ONLY
DEBUG = False  # Never True in production!

# Only allow your domain
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']

# Secret key from environment
# Why? Never hardcode secrets in code
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# HTTPS/SSL Settings
SECURE_SSL_REDIRECT = True  # Force HTTPS
SESSION_COOKIE_SECURE = True  # Only send session cookie over HTTPS
CSRF_COOKIE_SECURE = True  # Only send CSRF cookie over HTTPS

# HSTS (HTTP Strict Transport Security)
# Tells browsers to only use HTTPS
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Security headers
SECURE_CONTENT_TYPE_NOSNIFF = True  # Prevent MIME sniffing
SECURE_BROWSER_XSS_FILTER = True  # XSS protection
X_FRAME_OPTIONS = 'DENY'  # Prevent clickjacking

# CSRF Protection
CSRF_COOKIE_HTTPONLY = True  # JavaScript can't access CSRF cookie
CSRF_TRUSTED_ORIGINS = ['https://yourdomain.com']

# Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 10},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

### SQL Injection Prevention

**Django ORM automatically prevents SQL injection.**

```python
# SAFE: ORM uses parameterized queries
products = Product.objects.filter(name=user_input)

# SAFE: Even with raw SQL, use parameters
products = Product.objects.raw(
    "SELECT * FROM products WHERE name = %s",
    [user_input]  # Parameters are escaped
)

# DANGEROUS: Never do this!
products = Product.objects.raw(
    f"SELECT * FROM products WHERE name = '{user_input}'"
    # User could input: ' OR '1'='1
)
```

### XSS (Cross-Site Scripting) Prevention

**Django templates auto-escape HTML.**

```html
<!-- SAFE: Automatically escaped -->
{{ user_input }}
<!-- <script>alert('xss')</script> becomes &lt;script&gt;... -->

<!-- DANGEROUS: Marks as safe, no escaping -->
{{ user_input|safe }}

<!-- When you need HTML (use with caution)-->
{% autoescape off %}
    {{ trusted_html_content }}
{% endautoescape %}
```

### CSRF Protection

**Cross-Site Request Forgery protection prevents attackers from submitting forms on behalf of users.**

```html
<!-- REQUIRED: Include in all POST forms -->
<form method="post">
    {% csrf_token %}  <!-- Generates hidden token field -->
    <!-- form fields -->
    <button type="submit">Submit</button>
</form>

<!-- Why? Without this, malicious sites could submit forms as your users -->
```

```python
# Exempt view from CSRF (rarely needed, e.g., webhooks)
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def webhook_view(request):
    # External service posts here
    pass

# AJAX requests need CSRF token
# Include in headers:
# X-CSRFToken: <token_value>
```

### Input Validation

**Always validate and sanitize user input.**

```python
from django.utils.html import escape

# Escape HTML
safe_text = escape(user_input)

# Use forms for validation
class CommentForm(forms.Form):
    text = forms.CharField(max_length=500)
    
    def clean_text(self):
        text = self.cleaned_data['text']
        # Custom validation
        if 'badword' in text.lower():
            raise forms.ValidationError('Contains prohibited content')
        return text

# Never trust user input
# BAD:
eval(user_input)  # Never do this!
exec(user_input)  # Never do this!

# GOOD:
# Validate, sanitize, use safe operations
```

### File Upload Security

```python
from django.core.validators import FileExtensionValidator

class Document(models.Model):
    file = models.FileField(
        upload_to='documents/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])]
    )
    
    def save(self, *args, **kwargs):
        # Validate file size
        if self.file.size > 5 * 1024 * 1024:  # 5MB
            raise ValidationError('File too large')
        super().save(*args, **kwargs)

# settings.py
# Limit upload size
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
```

### Rate Limiting (DRF)

**Prevent abuse by limiting requests.**

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',  # Anonymous users: 100 requests per day
        'user': '1000/day',  # Authenticated: 1000 requests per day
    }
}

# Custom throttle
from rest_framework.throttling import UserRateThrottle

class BurstRateThrottle(UserRateThrottle):
    rate = '60/min'  # 60 requests per minute

# Apply to view
class ProductViewSet(viewsets.ModelViewSet):
    throttle_classes = [BurstRateThrottle]
```

### Environment Variables

**Never hardcode secrets in code.**

```python
# .env file (never commit to git!)
DEBUG=False
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost/dbname
API_KEY=external-api-key

# settings.py
import os
from pathlib import Path

# Load environment variables
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
SECRET_KEY = os.environ.get('SECRET_KEY')
DATABASE_URL = os.environ.get('DATABASE_URL')

# Use python-decouple or django-environ for better handling
# pip install python-decouple
from decouple import config

DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY')
```

---

## Performance Optimization

### Database Query Optimization

**The #1 cause of slow Django apps is inefficient database queries.**

```python
# N+1 Problem (BAD)
# 1 query for products + N queries for categories = N+1 queries
products = Product.objects.all()
for product in products:
    print(product.category.name)  # Each triggers a query!

# Solution: select_related (GOOD)
# 1 query with JOIN
products = Product.objects.select_related('category').all()
for product in products:
    print(product.category.name)  # No additional query

# For ManyToMany (BAD)
products = Product.objects.all()
for product in products:
    print(product.tags.all())  # N queries

# Solution: prefetch_related (GOOD)
# 2 queries total
products = Product.objects.prefetch_related('tags').all()
for product in products:
    print(product.tags.all())  # No additional query

# Load only needed fields
Product.objects.only('name', 'price')  # Load only these
Product.objects.defer('description')  # Load everything except this

# Count efficiently
# BAD: len(Product.objects.all())  # Loads all records
# GOOD:
Product.objects.count()  # SQL COUNT(), much faster

# Check existence
# BAD: if len(products) > 0:
# GOOD:
if Product.objects.exists():

# Bulk operations
# BAD: Loop with save()
for product in products:
    product.price *= 1.1
    product.save()  # N queries

# GOOD: Bulk update
Product.objects.all().update(price=F('price') * 1.1)  # 1 query

# Use iterator for large datasets
# Why? Doesn't load everything into memory
for product in Product.objects.iterator(chunk_size=1000):
    process(product)
```

### Database Indexes

**Indexes make queries faster but slow down writes.**

**When to add indexes:**
- Fields used in filter(), exclude()
- Fields used in order_by()
- Foreign keys (automatic)
- Fields in WHERE clauses

```python
class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)  # Single field index
    sku = models.CharField(max_length=50)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            # Composite index (multiple fields)
            # Why? Queries filtering by both fields are faster
            models.Index(fields=['category', 'price']),
            
            # Index with ordering
            models.Index(fields=['created_at', '-price']),
            
            # Partial index (PostgreSQL only)
            models.Index(
                fields=['price'],
                condition=models.Q(available=True),
                name='available_products_price_idx'
            ),
        ]

# Check if indexes are used
# Print SQL to see if indexes are utilized
print(queryset.query)
print(queryset.explain())  # Shows query execution plan
```

### Caching Strategies

**Different caching levels for different needs.**

```python
# 1. Database query caching
from django.core.cache import cache

def get_featured_products():
    cache_key = 'featured_products'
    products = cache.get(cache_key)
    
    if products is None:
        products = list(
            Product.objects
            .filter(is_featured=True)
            .select_related('category')[:10]
        )
        cache.set(cache_key, products, 60 * 15)  # 15 minutes
    
    return products

# 2. Template fragment caching
{% load cache %}
{% cache 600 product_sidebar %}
    <!-- Expensive template code -->
{% endcache %}

# 3. View caching
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)
def product_list(request):
    pass

# 4. Low-level caching
cache.set('key', 'value', 300)
value = cache.get('key')

# Cache invalidation (very important!)
@receiver(post_save, sender=Product)
def clear_product_cache(sender, instance, **kwargs):
    cache.delete('featured_products')
    cache.delete(f'product_{instance.id}')
```

### Connection Pooling

**Reuse database connections instead of creating new ones.**

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydb',
        'USER': 'myuser',
        'PASSWORD': 'mypassword',
        'HOST': 'localhost',
        'PORT': '5432',
        'CONN_MAX_AGE': 600,  # Keep connections alive for 10 minutes
        # Why? Creating connections is expensive
    }
}

# For even better performance, use pgBouncer
# External connection pooler for PostgreSQL
```

### Pagination

**Don't load thousands of records at once.**

```python
from django.core.paginator import Paginator

def product_list(request):
    products = Product.objects.all()
    
    # Paginate
    paginator = Paginator(products, 25)  # 25 per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'list.html', {'page_obj': page_obj})

# In template
{% for product in page_obj %}
    {{ product.name }}
{% endfor %}

<!-- Pagination controls -->
{% if page_obj.has_previous %}
    <a href="?page={{ page_obj.previous_page_number }}">Previous</a>
{% endif %}

<span>Page {{ page_obj.number }} of {{ page_obj.paginator.num_pages }}</span>

{% if page_obj.has_next %}
    <a href="?page={{ page_obj.next_page_number }}">Next</a>
{% endif %}

# DRF Pagination
from rest_framework.pagination import PageNumberPagination

class StandardPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    pagination_class = StandardPagination
```

### Monitoring Query Performance

```python
# settings.py (development only!)
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',  # Shows all SQL queries
        },
    },
}

# Django Debug Toolbar (development tool)
# pip install django-debug-toolbar

INSTALLED_APPS = [
    ...
    'debug_toolbar',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    ...
]

INTERNAL_IPS = ['127.0.0.1']

# Shows:
# - All SQL queries
# - Query execution time
# - Number of queries
# - Cache hits/misses
```

---

## Management Commands

### What are Management Commands?

**Custom Django commands you run from the terminal.**

**Why?** Automate tasks, data migration, maintenance, cron jobs.

### Creating a Command

```python
# management/commands/cleanup_products.py
from django.core.management.base import BaseCommand, CommandError
from products.models import Product
from datetime import timedelta
from django.utils import timezone

class Command(BaseCommand):
    help = 'Delete inactive products older than specified days'
    
    def add_arguments(self, parser):
        """Define command-line arguments"""
        # Why? Makes command flexible and reusable
        
        # Required argument
        parser.add_argument('days', type=int, help='Number of days')
        
        # Optional argument
        parser.add_argument(
            '--category',
            type=str,
            help='Filter by category slug'
        )
        
        # Flag (boolean)
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without deleting'
        )
    
    def handle(self, *args, **options):
        """Main command logic"""
        days = options['days']
        category = options.get('category')
        dry_run = options['dry_run']
        
        # Calculate cutoff date
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Build query
        products = Product.objects.filter(
            is_active=False,
            updated_at__lt=cutoff_date
        )
        
        if category:
            products = products.filter(category__slug=category)
        
        count = products.count()
        
        if dry_run:
            # Show what would be deleted
            self.stdout.write(
                self.style.WARNING(f'Would delete {count} products (DRY RUN)')
            )
            for product in products[:10]:  # Show first 10
                self.stdout.write(f'  - {product.name}')
        else:
            # Actually delete
            products.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully deleted {count} products')
            )

# Run command
# python manage.py cleanup_products 30
# python manage.py cleanup_products 30 --category electronics
# python manage.py cleanup_products 30 --dry-run
```

### More Command Examples

```python
# Import data from CSV
class Command(BaseCommand):
    help = 'Import products from CSV file'
    
    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str)
    
    def handle(self, *args, **options):
        import csv
        
        with open(options['csv_file'], 'r') as file:
            reader = csv.DictReader(file)
            products = []
            
            for row in reader:
                products.append(Product(
                    name=row['name'],
                    price=row['price'],
                    stock=row['stock']
                ))
            
            # Bulk create for speed
            Product.objects.bulk_create(products)
            
            self.stdout.write(
                self.style.SUCCESS(f'Imported {len(products)} products')
            )

# Send email notifications
class Command(BaseCommand):
    help = 'Send daily summary emails'
    
    def handle(self, *args, **options):
        from django.core.mail import send_mass_mail
        
        users = User.objects.filter(email_notifications=True)
        messages = []
        
        for user in users:
            subject = f'Daily Summary for {user.username}'
            message = generate_summary(user)
            messages.append((subject, message, 'from@example.com', [user.email]))
        
        send_mass_mail(messages)
        
        self.stdout.write(
            self.style.SUCCESS(f'Sent {len(messages)} emails')
        )

# Database backup
class Command(BaseCommand):
    help = 'Backup database'
    
    def handle(self, *args, **options):
        import subprocess
        from datetime import datetime
        
        filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        
        # Run pg_dump
        subprocess.run([
            'pg_dump',
            '-U', 'dbuser',
            '-h', 'localhost',
            'dbname',
            '-f', filename
        ])
        
        self.stdout.write(
            self.style.SUCCESS(f'Database backed up to {filename}')
        )
```

---

## Additional Important Topics

### Admin Customization

**Customize Django's admin interface.**

```python
# admin.py
from django.contrib import admin
from .models import Product, Category

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # List view customization
    list_display = ['name', 'price', 'stock', 'category', 'available', 'created_at']
    list_filter = ['available', 'category', 'created_at']  # Filter sidebar
    search_fields = ['name', 'description']  # Search box
    list_editable = ['price', 'stock', 'available']  # Edit in list view
    list_per_page = 50  # Pagination
    
    # Detail view customization
    fields = ['name', 'slug', 'category', 'price', 'stock', 'description']
    readonly_fields = ['created_at', 'updated_at']  # Can't edit
    
    # Organize fields into sections
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category')
        }),
        ('Pricing', {
            'fields': ('price', 'stock')
        }),
        ('Description', {
            'fields': ('description',),
            'classes': ('collapse',)  # Collapsible section
        }),
    )
    
    # Inline editing of related models
    class TagInline(admin.TabularInline):
        model = Product.tags.through
        extra = 1
    
    inlines = [TagInline]
    
    # Custom actions
    actions = ['make_available', 'make_unavailable']
    
    def make_available(self, request, queryset):
        """Mark selected products as available"""
        updated = queryset.update(available=True)
        self.message_user(request, f'{updated} products marked as available')
    make_available.short_description = "Mark as available"
    
    def make_unavailable(self, request, queryset):
        updated = queryset.update(available=False)
        self.message_user(request, f'{updated} products marked as unavailable')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'product_count']
    prepopulated_fields = {'slug': ('name',)}  # Auto-generate slug
    
    def product_count(self, obj):
        """Add custom column"""
        return obj.products.count()
    product_count.short_description = 'Products'
```

### Pagination Deep Dive

```python
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def product_list(request):
    products = Product.objects.all()
    paginator = Paginator(products, 25)
    
    page = request.GET.get('page')
    
    try:
        products_page = paginator.page(page)
    except PageNotAnInteger:
        # Not an integer, show first page
        products_page = paginator.page(1)
    except EmptyPage:
        # Page out of range, show last page
        products_page = paginator.page(paginator.num_pages)
    
    # Paginator attributes
    # paginator.count: Total items
    # paginator.num_pages: Total pages
    # products_page.number: Current page
    # products_page.has_previous(): Has previous page?
    # products_page.has_next(): Has next page?
```

### File Handling

```python
# models.py
class Document(models.Model):
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def delete(self, *args, **kwargs):
        # Delete file when model is deleted
        self.file.delete()
        super().delete(*args, **kwargs)

# views.py
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        
        # File attributes
        # uploaded_file.name: Original filename
        # uploaded_file.size: File size in bytes
        # uploaded_file.content_type: MIME type
        
        # Save file
        doc = Document(file=uploaded_file)
        doc.save()
        
        return redirect('success')

# settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# urls.py (development only)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Your URLs
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### Custom Template Tags & Filters

```python
# templatetags/custom_tags.py
from django import template

register = template.Library()

# Custom filter
@register.filter
def multiply(value, arg):
    """Multiply value by arg"""
    return value * arg

# Usage: {{ product.price|multiply:1.1 }}

# Custom simple tag
@register.simple_tag
def current_time(format_string):
    from datetime import datetime
    return datetime.now().strftime(format_string)

# Usage: {% current_time "%Y-%m-%d %H:%M" %}

# Custom inclusion tag (renders template)
@register.inclusion_tag('includes/product_card.html')
def show_product(product):
    return {'product': product}

# Usage: {% show_product product %}
```

### Sending Emails

```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-password'
DEFAULT_FROM_EMAIL = 'your-email@gmail.com'

# Simple email
from django.core.mail import send_mail

send_mail(
    'Subject',
    'Message body',
    'from@example.com',
    ['to@example.com'],
    fail_silently=False,
)

# HTML email
from django.core.mail import EmailMultiAlternatives

subject = 'Hello'
text_content = 'This is plain text'
html_content = '<p>This is <strong>HTML</strong></p>'

msg = EmailMultiAlternatives(subject, text_content, 'from@example.com', ['to@example.com'])
msg.attach_alternative(html_content, "text/html")
msg.send()

# Email with template
from django.template.loader import render_to_string

html_message = render_to_string('emails/welcome.html', {
    'user': user,
    'activation_link': link
})

send_mail(
    'Welcome!',
    '',
    'from@example.com',
    [user.email],
    html_message=html_message
)
```

---

## Common Patterns & Best Practices

### Abstract Base Models

**Create reusable base models.**

```python
class TimeStampedModel(models.Model):
    """Add timestamps to any model"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True  # Won't create a table

class SoftDeleteModel(models.Model):
    """Add soft delete functionality"""
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def delete(self, *args, **kwargs):
        """Soft delete instead of hard delete"""
        self.deleted_at = timezone.now()
        self.save()
    
    def hard_delete(self):
        """Actually delete from database"""
        super().delete()

# Use in your models
class Product(TimeStampedModel, SoftDeleteModel):
    name = models.CharField(max_length=200)
    # Automatically has: created_at, updated_at, deleted_at, soft delete
```

### Slug Auto-Generation

```python
from django.utils.text import slugify

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)
    
    def generate_unique_slug(self):
        """Generate unique slug from name"""
        slug = slugify(self.name)
        unique_slug = slug
        num = 1
        
        while Product.objects.filter(slug=unique_slug).exists():
            unique_slug = f'{slug}-{num}'
            num += 1
        
        return unique_slug
```

### Service Layer Pattern

**Keep business logic out of views.**

```python
# services.py
class OrderService:
    """Handle order-related business logic"""
    
    @staticmethod
    def create_order(user, items):
        """Create order with items"""
        with transaction.atomic():
            # Calculate total
            total = sum(item['price'] * item['quantity'] for item in items)
            
            # Create order
            order = Order.objects.create(user=user, total=total)
            
            # Create items
            for item_data in items:
                OrderItem.objects.create(order=order, **item_data)
            
            # Update inventory
            OrderService.update_inventory(items)
            
            # Send email
            OrderService.send_confirmation(order)
            
            return order
    
    @staticmethod
    def update_inventory(items):
        """Update product stock"""
        for item in items:
            product = Product.objects.get(id=item['product_id'])
            product.stock -= item['quantity']
            product.save()
    
    @staticmethod
    def send_confirmation(order):
        """Send order confirmation email"""
        send_mail(
            'Order Confirmation',
            f'Your order #{order.id} has been received.',
            'from@example.com',
            [order.user.email]
        )

# views.py
def create_order_view(request):
    items = get_items_from_request(request)
    order = OrderService.create_order(request.user, items)
    return JsonResponse({'order_id': order.id})
```

### Environment-Specific Settings

```python
# settings/base.py (common settings)
INSTALLED_APPS = [...]
MIDDLEWARE = [...]

# settings/development.py
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# settings/production.py
from .base import *

DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # ... production database
    }
}

SECURE_SSL_REDIRECT = True
# ... production security settings

# Activate with environment variable
# export DJANGO_SETTINGS_MODULE=myproject.settings.production
```

---

## Quick Reference

### Django Shell Commands

```bash
# Open Django shell
python manage.py shell

# In shell:
from products.models import Product

# Create
product = Product.objects.create(name='Test', price=100)

# Get
product = Product.objects.get(id=1)

# Filter
products = Product.objects.filter(price__gte=100)

# Update
Product.objects.filter(category_id=1).update(discount=10)

# Delete
Product.objects.filter(id=5).delete()
```

### Common manage.py Commands

```bash
# Create new app
python manage.py startapp appname

# Database migrations
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
python manage.py sqlmigrate appname 0001

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
python manage.py runserver 8080
python manage.py runserver 0.0.0.0:8000

# Collect static files
python manage.py collectstatic

# Database shell
python manage.py dbshell

# Check for issues
python manage.py check

# Flush database (delete all data)
python manage.py flush
```

### Useful Packages

```bash
# REST API
pip install djangorestframework
pip install django-filter
pip install djangorestframework-simplejwt

# Development tools
pip install django-debug-toolbar
pip install django-extensions

# Async tasks
pip install celery redis

# Environment variables
pip install python-decouple
pip install django-environ

# Image handling
pip install Pillow

# Testing
pip install pytest-django
pip install factory-boy

# CORS (for API)
pip install django-cors-headers

# PostgreSQL
pip install psycopg2-binary

# Redis cache
pip install django-redis
```

---

## Summary

### Topics Covered

This guide covered:

1. **Models** - Define database structure with Python classes
2. **QuerySets** - Retrieve and manipulate data efficiently
3. **Views** - Handle requests (FBV, CBV, API)
4. **URLs** - Route requests to views
5. **Forms** - Handle user input safely
6. **Serializers** - Convert data to/from JSON
7. **Authentication** - Identify users and control access
8. **Middleware** - Process every request/response
9. **Caching** - Speed up your application
10. **Signals** - React to events
11. **Testing** - Verify code works correctly
12. **Celery** - Run background tasks
13. **Security** - Protect your application
14. **Performance** - Make it fast
15. **Management Commands** - Automate tasks

### Key Principles

- Use the ORM (avoid raw SQL)
- Optimize database queries (select_related, prefetch_related)
- Cache expensive operations
- Validate all user input
- Test your code
- Keep secrets in environment variables
- Follow Django conventions
