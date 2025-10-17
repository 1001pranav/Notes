# Django Models - Complete Cheatsheet

## Table of Contents
1. [Model Methods](#model-methods)
2. [Managers & QuerySets](#managers--querysets)
3. [Model Inheritance](#model-inheritance)
4. [Validation](#validation)
5. [Advanced Features](#advanced-features)
6. [Field Types](#field-types)
7. [Field Options](#field-options)
8. [Relationships](#relationships)
9. [Meta Options](#meta-options)
10. [Quick Reference](#quick-reference)

---

## What are Models?

**Models are Python classes that define the structure of your database tables.**

Each model = One database table
Each attribute = One database column

### Why Models?
- ✅ Write Python, not SQL
- ✅ Database-agnostic (works with PostgreSQL, MySQL, SQLite, etc.)
- ✅ Automatic migrations
- ✅ Built-in validation
- ✅ Relationships handled automatically
- ✅ Admin interface integration

### Basic Model Structure

```python
from django.db import models

class Product(models.Model):
    """Product model - becomes 'products_product' table"""
    name = models.CharField(max_length=200)  # Column: VARCHAR(200)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Column: DECIMAL(10,2)
    created_at = models.DateTimeField(auto_now_add=True)  # Column: TIMESTAMP
    
    def __str__(self):
        """String representation"""
        return self.name
    
    class Meta:
        constraints = [
            # Only active products must have unique names
            models.UniqueConstraint(
                fields=['name'],
                condition=models.Q(is_active=True),
                name='unique_active_product_name'
            )
        ]
```

---

## Model Methods

**Add custom behavior to your models.**

### Essential Methods

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percent = models.IntegerField(default=0)
    stock = models.IntegerField(default=0)
    
    # __str__: String representation
    # ALWAYS define this!
    def __str__(self):
        """How object appears in admin, shell, logs"""
        return self.name
    
    # get_absolute_url: Canonical URL for object
    # Used by: admin, redirects, templates
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('product_detail', kwargs={'slug': self.slug})
    
    # save: Override to add custom logic
    def save(self, *args, **kwargs):
        """Called when saving object"""
        # Auto-generate slug if empty
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        
        # Call parent save
        super().save(*args, **kwargs)
    
    # delete: Override to add custom logic
    def delete(self, *args, **kwargs):
        """Called when deleting object"""
        # Delete associated files
        if self.image:
            self.image.delete(save=False)
        
        # Call parent delete
        super().delete(*args, **kwargs)
    
    # clean: Validation method
    def clean(self):
        """Called by full_clean() and ModelForm validation"""
        from django.core.exceptions import ValidationError
        
        if self.price < 0:
            raise ValidationError('Price cannot be negative')
        
        if self.discount_percent > 100:
            raise ValidationError('Discount cannot exceed 100%')
    
    # Properties: Computed attributes
    @property
    def discounted_price(self):
        """Calculate discounted price"""
        return self.price * (1 - self.discount_percent / 100)
    
    @property
    def is_in_stock(self):
        """Check if product is available"""
        return self.stock > 0
    
    @property
    def is_on_sale(self):
        """Check if product has discount"""
        return self.discount_percent > 0
    
    # Regular methods
    def apply_discount(self, percent):
        """Apply discount to product"""
        self.discount_percent = percent
        self.save()
    
    def restock(self, quantity):
        """Add stock"""
        self.stock += quantity
        self.save()
    
    def sell(self, quantity):
        """Reduce stock after sale"""
        if self.stock < quantity:
            raise ValueError('Insufficient stock')
        self.stock -= quantity
        self.save()
```

### Advanced save() Examples

```python
class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    slug = models.SlugField(unique=True, blank=True)
    status = models.CharField(max_length=20, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)
    word_count = models.IntegerField(default=0)
    
    def save(self, *args, **kwargs):
        # Auto-generate unique slug
        if not self.slug:
            self.slug = self.generate_unique_slug()
        
        # Set published_at when status changes to published
        if self.status == 'published' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        # Calculate word count
        self.word_count = len(self.content.split())
        
        # Save
        super().save(*args, **kwargs)
    
    def generate_unique_slug(self):
        """Generate unique slug from title"""
        from django.utils.text import slugify
        slug = slugify(self.title)
        unique_slug = slug
        num = 1
        
        while Article.objects.filter(slug=unique_slug).exists():
            unique_slug = f'{slug}-{num}'
            num += 1
        
        return unique_slug

# Conditional save
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        # Check if this is an update (has pk) or create (no pk)
        is_new = self.pk is None
        
        if is_new:
            print("Creating new product")
        else:
            print(f"Updating product {self.pk}")
        
        super().save(*args, **kwargs)

# save with update_fields
product = Product.objects.get(id=1)
product.price = 100
product.save(update_fields=['price'])  # Only update price column
```

### Model Validation

```python
from django.core.exceptions import ValidationError

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    
    def clean(self):
        """Model-level validation"""
        # Called by: full_clean(), ModelForm.is_valid()
        
        # Validate price relationship
        if self.compare_at_price and self.price > self.compare_at_price:
            raise ValidationError(
                'Price cannot be higher than compare price'
            )
        
        # Validate date range
        if self.end_date < self.start_date:
            raise ValidationError(
                'End date must be after start date'
            )
        
        # Field-specific error
        if self.price < 0:
            raise ValidationError({
                'price': 'Price must be positive'
            })
    
    def save(self, *args, **kwargs):
        # Call full_clean() before saving
        # Note: save() doesn't call clean() automatically!
        self.full_clean()
        super().save(*args, **kwargs)

# Usage
try:
    product = Product(
        name='Test',
        price=100,
        compare_at_price=50,  # Invalid!
        start_date='2024-12-01',
        end_date='2024-11-01'  # Invalid!
    )
    product.full_clean()  # Raises ValidationError
except ValidationError as e:
    print(e.message_dict)
```

---

## Managers & QuerySets

**Managers control how you retrieve objects from the database.**

### Default Manager

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    
    # Default manager (automatically created)
    objects = models.Manager()

# Usage
Product.objects.all()
Product.objects.filter(is_active=True)
```

### Custom Manager

```python
class ProductManager(models.Manager):
    """Custom manager with additional methods"""
    
    def active(self):
        """Get only active products"""
        return self.filter(is_active=True)
    
    def featured(self):
        """Get featured products"""
        return self.filter(is_featured=True, is_active=True)
    
    def in_price_range(self, min_price, max_price):
        """Get products in price range"""
        return self.filter(price__gte=min_price, price__lte=max_price)

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Replace default manager
    objects = ProductManager()

# Usage
Product.objects.active()
Product.objects.featured()
Product.objects.in_price_range(10, 100)

# Chain methods
Product.objects.active().in_price_range(10, 100).order_by('name')
```

### Custom QuerySet

**More powerful: Chainable custom methods**

```python
class ProductQuerySet(models.QuerySet):
    """Custom QuerySet with chainable methods"""
    
    def active(self):
        return self.filter(is_active=True)
    
    def featured(self):
        return self.filter(is_featured=True)
    
    def in_price_range(self, min_price, max_price):
        return self.filter(price__gte=min_price, price__lte=max_price)
    
    def with_category(self):
        return self.select_related('category')
    
    def with_tags(self):
        return self.prefetch_related('tags')

class ProductManager(models.Manager):
    def get_queryset(self):
        """Return custom QuerySet"""
        return ProductQuerySet(self.model, using=self._db)
    
    # Proxy methods for convenience
    def active(self):
        return self.get_queryset().active()
    
    def featured(self):
        return self.get_queryset().featured()

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag)
    
    objects = ProductManager()

# Usage - All chainable!
products = (
    Product.objects
    .active()
    .featured()
    .in_price_range(10, 100)
    .with_category()
    .with_tags()
    .order_by('-created_at')
)
```

### Multiple Managers

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    
    # Default manager (for most queries)
    objects = ProductManager()
    
    # Alternative manager (for admin, includes inactive)
    all_objects = models.Manager()

# Usage
Product.objects.all()      # Only active (custom manager)
Product.all_objects.all()  # Everything (default manager)

# In admin.py
class ProductAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        # Use all_objects to show inactive in admin
        return Product.all_objects.all()
```

### Manager Methods vs QuerySet Methods

```python
class ProductManager(models.Manager):
    # Manager method - NOT chainable
    def featured_count(self):
        """Returns a number"""
        return self.filter(is_featured=True).count()

class ProductQuerySet(models.QuerySet):
    # QuerySet method - chainable!
    def featured(self):
        """Returns a QuerySet"""
        return self.filter(is_featured=True)

class Product(models.Model):
    objects = ProductManager.from_queryset(ProductQuerySet)()

# Usage
Product.objects.featured().count()  # ✅ Works (chainable)
Product.objects.featured_count()    # ✅ Works (but not chainable)
```

### Manager Inheritance

```python
class SoftDeleteManager(models.Manager):
    """Manager that excludes soft-deleted objects"""
    
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

class Product(models.Model):
    name = models.CharField(max_length=200)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    objects = SoftDeleteManager()  # Only non-deleted
    all_objects = models.Manager()  # Everything
    
    def delete(self, *args, **kwargs):
        """Soft delete"""
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.save()
    
    def hard_delete(self):
        """Actually delete from database"""
        super().delete()

# Usage
Product.objects.all()      # Only non-deleted
Product.all_objects.all()  # Including deleted
```

---

## Model Inheritance

### Abstract Base Classes

**Use when: Share common fields across models**

```python
class TimeStampedModel(models.Model):
    """Add timestamps to any model"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True  # No database table created
        ordering = ['-created_at']

class SoftDeleteModel(models.Model):
    """Add soft delete functionality"""
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def delete(self, *args, **kwargs):
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.save()

# Use in models
class Product(TimeStampedModel, SoftDeleteModel):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # Inherits: created_at, updated_at, deleted_at, delete()

class Article(TimeStampedModel):
    title = models.CharField(max_length=200)
    content = models.TextField()
    # Inherits: created_at, updated_at

# Database tables created:
# - products (with created_at, updated_at, deleted_at)
# - articles (with created_at, updated_at)
# - NO timestampedmodel or softdeletemodel table
```

### Multi-table Inheritance

**Use when: Extend a model with additional fields**

```python
class Place(models.Model):
    """Base model"""
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)

class Restaurant(Place):
    """Extends Place with restaurant-specific fields"""
    cuisine = models.CharField(max_length=50)
    capacity = models.IntegerField()
    
    # Inherits: name, address
    # Adds: cuisine, capacity

class Bar(Place):
    """Extends Place with bar-specific fields"""
    has_live_music = models.BooleanField(default=False)
    happy_hour = models.TimeField()

# Database tables created:
# - place (id, name, address)
# - restaurant (place_ptr_id FK, cuisine, capacity)
# - bar (place_ptr_id FK, has_live_music, happy_hour)

# Usage
restaurant = Restaurant.objects.create(
    name='Tasty Food',
    address='123 Main St',
    cuisine='Italian',
    capacity=50
)

# Access parent fields
print(restaurant.name)      # "Tasty Food"
print(restaurant.address)   # "123 Main St"

# Access from parent
place = Place.objects.get(id=restaurant.id)
print(place.restaurant.cuisine)  # "Italian"

# Query
Restaurant.objects.filter(name='Tasty Food')  # Works
Place.objects.filter(name='Tasty Food')       # Returns Place object
```

### Proxy Models

**Use when: Change behavior without changing database**

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_featured = models.BooleanField(default=False)

class FeaturedProduct(Product):
    """Same table, different default behavior"""
    
    class Meta:
        proxy = True  # No new table
        ordering = ['-price']
    
    def __str__(self):
        return f"⭐ {self.name}"
    
    # Custom manager
    objects = models.Manager()
    
    def save(self, *args, **kwargs):
        self.is_featured = True
        super().save(*args, **kwargs)

# Both use same database table
product = Product.objects.create(name='Regular', price=10)
featured = FeaturedProduct.objects.create(name='Special', price=20)

# Different default ordering
Product.objects.all()         # All products
FeaturedProduct.objects.all() # Same products, different order

# Database: Only ONE table (product)
```

**Use cases for proxy models:**
- Different default ordering
- Additional methods
- Different managers
- Different admin interface

```python
# Example: Different admin displays
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)

class PublishedProduct(Product):
    class Meta:
        proxy = True
    
    objects = models.Manager()
    
    def get_queryset(self):
        return super().get_queryset().filter(status='published')

class DraftProduct(Product):
    class Meta:
        proxy = True
    
    objects = models.Manager()
    
    def get_queryset(self):
        return super().get_queryset().filter(status='draft')

# admin.py
@admin.register(PublishedProduct)
class PublishedProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price']
    # Only shows published

@admin.register(DraftProduct)
class DraftProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price']
    # Only shows drafts
```

---

## Validation

### Field-Level Validation

```python
from django.core.exceptions import ValidationError

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def clean_price(self):
        """Validate price field"""
        if self.price < 0:
            raise ValidationError('Price cannot be negative')
        if self.price > 1000000:
            raise ValidationError('Price is too high')
        return self.price

# Better: Use validators
from django.core.validators import MinValueValidator, MaxValueValidator

class Product(models.Model):
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(1000000)
        ]
    )
```

### Model-Level Validation

```python
class Event(models.Model):
    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    max_attendees = models.IntegerField()
    registered_attendees = models.IntegerField(default=0)
    
    def clean(self):
        """Validate entire model"""
        # Validate date range
        if self.end_date < self.start_date:
            raise ValidationError({
                'end_date': 'End date must be after start date'
            })
        
        # Validate attendee count
        if self.registered_attendees > self.max_attendees:
            raise ValidationError(
                'Registered attendees cannot exceed maximum'
            )
        
        # Cross-field validation
        from django.utils import timezone
        if self.start_date < timezone.now().date():
            raise ValidationError({
                'start_date': 'Cannot create event in the past'
            })
```

### Custom Validators

```python
from django.core.exceptions import ValidationError

def validate_positive(value):
    """Validator function"""
    if value < 0:
        raise ValidationError(f'{value} is not positive')

def validate_file_size(value):
    """Validate file size (max 5MB)"""
    filesize = value.size
    if filesize > 5 * 1024 * 1024:
        raise ValidationError('File size cannot exceed 5MB')

class Product(models.Model):
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[validate_positive]
    )
    
    image = models.ImageField(
        upload_to='products/',
        validators=[validate_file_size]
    )

# Reusable validator class
from django.core.validators import BaseValidator

class MaxFileSizeValidator(BaseValidator):
    message = 'File size cannot exceed %(limit_value)s MB'
    code = 'max_file_size'
    
    def compare(self, value, limit_value):
        # value.size is in bytes
        return value.size > limit_value * 1024 * 1024

class Product(models.Model):
    image = models.ImageField(
        upload_to='products/',
        validators=[MaxFileSizeValidator(5)]  # 5MB
    )
```

---

## Advanced Features

### Database Functions

```python
from django.db.models import F, Value
from django.db.models.functions import Concat, Lower, Upper, Length

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# Concatenate fields
Product.objects.annotate(
    full_description=Concat('name', Value(' - :
        """Metadata about the model"""
        db_table = 'products'
        ordering = ['-created_at']
```

**What Django Creates:**
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

---

## Field Types

### Text Fields

```python
from django.db import models

class Article(models.Model):
    # CharField: Limited text (must specify max_length)
    # Use for: Names, titles, short descriptions
    title = models.CharField(max_length=200)
    # DB: VARCHAR(200)
    
    # TextField: Unlimited text
    # Use for: Long descriptions, articles, comments
    content = models.TextField()
    # DB: TEXT
    
    # SlugField: URL-friendly text (letters, numbers, hyphens, underscores)
    # Use for: URL slugs, identifiers
    slug = models.SlugField(max_length=200, unique=True)
    # DB: VARCHAR(200)
    # Example: "my-article-title"
    
    # EmailField: Email address (validates format)
    # Use for: Email addresses
    author_email = models.EmailField()
    # DB: VARCHAR(254)
    # Validates: user@example.com
    
    # URLField: Web address (validates format)
    # Use for: Website URLs
    website = models.URLField(max_length=200)
    # DB: VARCHAR(200)
    # Validates: https://example.com
    
    # UUIDField: Universally unique identifier
    # Use for: Public IDs, API keys (not sequential like auto-increment)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    # DB: UUID
    # Example: "550e8400-e29b-41d4-a716-446655440000"
```

**When to use which:**
- **CharField**: Known max length (names, titles) - 200 chars typically
- **TextField**: Unknown length (articles, descriptions) - unlimited
- **SlugField**: URLs (article-slug, product-url)
- **EmailField**: Email addresses (auto-validates format)
- **URLField**: Web addresses (auto-validates format)

### Numeric Fields

```python
class Product(models.Model):
    # IntegerField: Whole numbers
    # Use for: Quantities, counts, ages
    stock = models.IntegerField(default=0)
    # DB: INTEGER
    # Range: -2147483648 to 2147483647
    
    # PositiveIntegerField: Only positive numbers (including 0)
    # Use for: Stock, quantity, age
    quantity = models.PositiveIntegerField(default=0)
    # DB: INTEGER with CHECK constraint
    # Range: 0 to 2147483647
    
    # BigIntegerField: Very large numbers
    # Use for: Large IDs, big counts
    views = models.BigIntegerField(default=0)
    # DB: BIGINT
    # Range: -9223372036854775808 to 9223372036854775807
    
    # SmallIntegerField: Small numbers
    # Use for: Small ranges like ratings (1-5)
    rating = models.SmallIntegerField()
    # DB: SMALLINT
    # Range: -32768 to 32767
    
    # DecimalField: Exact decimal numbers
    # Use for: Money, precise calculations
    # REQUIRED: max_digits and decimal_places
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # DB: DECIMAL(10, 2)
    # Example: 99999999.99
    # Why not FloatField? Exact math (no rounding errors)
    
    # FloatField: Approximate decimal numbers
    # Use for: Scientific data, coordinates (where precision isn't critical)
    latitude = models.FloatField()
    # DB: DOUBLE PRECISION
    # Warning: Can have rounding errors!
```

**Money Fields Comparison:**
```python
# ❌ WRONG for money
price = models.FloatField()
# Problem: 0.1 + 0.2 = 0.30000000000000004

# ✅ CORRECT for money
price = models.DecimalField(max_digits=10, decimal_places=2)
# Result: 0.1 + 0.2 = 0.3 (exact)
```

### Boolean Fields

```python
class Product(models.Model):
    # BooleanField: True or False (cannot be NULL)
    # Use for: Yes/no flags
    is_active = models.BooleanField(default=True)
    # DB: BOOLEAN
    # Values: True or False (never NULL)
    
    # NullBooleanField (deprecated in Django 4.0+)
    # Use BooleanField with null=True instead
    is_featured = models.BooleanField(null=True, blank=True)
    # DB: BOOLEAN
    # Values: True, False, or NULL
```

**When to use:**
- **BooleanField**: When you need yes/no (is_active, is_published)
- **BooleanField(null=True)**: When "unknown" is valid (is_verified: True/False/Unknown)

### Date and Time Fields

```python
from django.utils import timezone

class Event(models.Model):
    # DateField: Date only (no time)
    # Use for: Birthdays, deadlines, publication dates
    event_date = models.DateField()
    # DB: DATE
    # Format: 2024-12-25
    
    # TimeField: Time only (no date)
    # Use for: Opening hours, schedules
    start_time = models.TimeField()
    # DB: TIME
    # Format: 14:30:00
    
    # DateTimeField: Date and time
    # Use for: Timestamps, exact moments
    created_at = models.DateTimeField()
    # DB: TIMESTAMP
    # Format: 2024-12-25 14:30:00
    
    # Auto timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    # Set once on creation, never changes
    # Use for: created_at, registered_at
    
    updated_at = models.DateTimeField(auto_now=True)
    # Updated every time .save() is called
    # Use for: updated_at, last_modified
    
    # DurationField: Time interval
    # Use for: Video length, process duration
    duration = models.DurationField()
    # DB: INTERVAL (PostgreSQL) or BIGINT (others)
    # Example: timedelta(hours=2, minutes=30)
```

**Best Practices:**
```python
# ✅ GOOD: Use timezone-aware datetimes
from django.utils import timezone

class Article(models.Model):
    published_at = models.DateTimeField(default=timezone.now)
    # Note: timezone.now (no parentheses) - callable
    
# ❌ BAD: Don't use datetime.now directly
from datetime import datetime
published_at = models.DateTimeField(default=datetime.now)
# Problem: Evaluated at import time, not creation time

# settings.py
USE_TZ = True  # Always True in production
TIME_ZONE = 'UTC'  # Store as UTC, convert for display
```

### File Fields

```python
class Document(models.Model):
    # FileField: Any file type
    # Use for: PDFs, documents, any files
    file = models.FileField(upload_to='documents/')
    # Uploads to: MEDIA_ROOT/documents/
    # DB: VARCHAR (stores file path)
    
    # ImageField: Images only (requires Pillow)
    # Use for: Photos, images, avatars
    image = models.ImageField(upload_to='images/%Y/%m/%d/')
    # Uploads to: MEDIA_ROOT/images/2024/12/25/
    # Validates: File is an actual image
    
    # upload_to with function
    def user_directory_path(instance, filename):
        # File will be uploaded to MEDIA_ROOT/user_<id>/<filename>
        return f'user_{instance.user.id}/{filename}'
    
    avatar = models.ImageField(upload_to=user_directory_path)
    
    # FileField attributes
    # file.name - filename with path
    # file.url - URL to access file
    # file.size - file size in bytes
    # file.path - absolute filesystem path
```

**File Upload Configuration:**
```python
# settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Install Pillow for ImageField
# pip install Pillow
```

**File Field Methods:**
```python
# Save file
document = Document.objects.get(id=1)
document.file.save('filename.pdf', File(open('path/to/file.pdf', 'rb')))

# Delete file
document.file.delete()  # Delete from filesystem
document.delete()  # Delete record and file
```

### Choice Fields

```python
class Order(models.Model):
    # Define choices
    STATUS_CHOICES = [
        ('pending', 'Pending'),      # (value_in_db, human_readable)
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    # DB: VARCHAR(20)
    # Stored: 'pending'
    # Display: 'Pending'
    
    # Access values
    order = Order.objects.get(id=1)
    order.status  # 'pending' (database value)
    order.get_status_display()  # 'Pending' (human-readable)
```

**Better: Use TextChoices (Django 3.0+)**
```python
from django.db import models

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Usage
    if order.status == Order.Status.PENDING:
        # Type-safe comparison
        pass
    
    # Get all choices
    Order.Status.choices  # List of tuples
    Order.Status.values   # ['pending', 'processing', ...]
    Order.Status.labels   # ['Pending', 'Processing', ...]
```

### JSON Field

```python
class Product(models.Model):
    # JSONField: Store JSON data (PostgreSQL, MySQL 5.7+, SQLite 3.9+)
    # Use for: Flexible data, configurations, metadata
    metadata = models.JSONField(default=dict)
    # DB: JSON or TEXT (depending on database)
    
    specifications = models.JSONField(default=dict, blank=True)
    
    # Example data:
    # {
    #     "color": "blue",
    #     "size": "large",
    #     "weight": 1.5,
    #     "features": ["waterproof", "durable"]
    # }

# Query JSON fields
Product.objects.filter(metadata__color='blue')
Product.objects.filter(specifications__weight__gt=1.0)
Product.objects.filter(metadata__features__contains='waterproof')
```

### PostgreSQL-Specific Fields

```python
from django.contrib.postgres.fields import ArrayField, HStoreField

class Product(models.Model):
    # ArrayField: Array of values (PostgreSQL only)
    # Use for: Tags, categories, multiple values
    tags = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list
    )
    # DB: TEXT[]
    # Example: ['electronics', 'featured', 'sale']
    
    # HStoreField: Key-value pairs (PostgreSQL only)
    # Use for: Attributes, properties
    attributes = HStoreField(default=dict)
    # DB: HSTORE
    # Example: {'color': 'red', 'size': 'M'}

# Query ArrayField
Product.objects.filter(tags__contains=['electronics'])
Product.objects.filter(tags__overlap=['sale', 'featured'])

# Query HStoreField
Product.objects.filter(attributes__color='red')
Product.objects.filter(attributes__has_key='size')
```

---

## Field Options

**Field options modify how fields behave.**

### Common Options

```python
class Product(models.Model):
    # null: Database allows NULL
    # Use for: Optional fields in database
    description = models.TextField(null=True)
    # DB: TEXT NULL
    
    # blank: Django forms allow empty
    # Use for: Optional fields in forms
    subtitle = models.CharField(max_length=200, blank=True)
    # Forms: Can be left empty
    
    # null=True + blank=True: Optional everywhere
    notes = models.TextField(null=True, blank=True)
    
    # default: Default value if none provided
    # Use for: Sensible defaults
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    # unique: Value must be unique
    # Use for: Emails, usernames, slugs
    email = models.EmailField(unique=True)
    slug = models.SlugField(unique=True)
    # DB: UNIQUE constraint
    
    # db_index: Create database index
    # Use for: Fields you search/filter often
    sku = models.CharField(max_length=50, db_index=True)
    # DB: CREATE INDEX ON table(sku)
    
    # editable: Can be edited in forms/admin
    # Use for: Calculated fields, read-only fields
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    
    # help_text: Help text in forms
    # Use for: User guidance
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Price in USD'
    )
    
    # verbose_name: Human-readable name
    # Use for: Better labels in admin
    name = models.CharField(
        max_length=200,
        verbose_name='Product Name'
    )
    
    # choices: Limit to specific values
    # Use for: Status, categories, enums
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('inactive', 'Inactive')],
        default='active'
    )
```

### null vs blank

**Common confusion: What's the difference?**

```python
# null=True: Database level
# blank=True: Validation level (forms)

# String fields (CharField, TextField, etc.)
# ❌ WRONG
name = models.CharField(max_length=200, null=True, blank=True)
# Problem: Can be NULL or empty string - two ways to represent "no value"

# ✅ RIGHT
name = models.CharField(max_length=200, blank=True, default='')
# Only empty string, never NULL

# Non-string fields (IntegerField, DateField, etc.)
# ✅ CORRECT
birth_date = models.DateField(null=True, blank=True)
# NULL is the only way to represent "no value"

# Summary:
# CharField/TextField: blank=True, default='' (no null=True)
# Other fields: null=True, blank=True
```

### Validators

```python
from django.core.validators import (
    MinValueValidator, MaxValueValidator,
    MinLengthValidator, MaxLengthValidator,
    EmailValidator, URLValidator,
    RegexValidator, FileExtensionValidator
)

class Product(models.Model):
    # Numeric validators
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]  # Must be >= 0
    )
    
    rating = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )
    
    # String validators
    name = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(3)]  # At least 3 characters
    )
    
    # Custom regex validator
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Enter a valid phone number'
            )
        ]
    )
    
    # File extension validator
    document = models.FileField(
        upload_to='documents/',
        validators=[
            FileExtensionValidator(
                allowed_extensions=['pdf', 'doc', 'docx']
            )
        ]
    )
```

---

## Relationships

### ForeignKey (Many-to-One)

**Use when: Many records link to one record**

Example: Many products → One category

```python
class Category(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    
    # ForeignKey: Many products can have the same category
    category = models.ForeignKey(
        Category,                    # Model to link to
        on_delete=models.CASCADE,    # What happens when category deleted?
        related_name='products',     # Reverse relation name
        null=True,                   # Optional
        blank=True
    )
    
    def __str__(self):
        return self.name
```

**on_delete Options:**

```python
# CASCADE: Delete products when category deleted
category = models.ForeignKey(Category, on_delete=models.CASCADE)
# Category deleted → All products deleted

# PROTECT: Prevent category deletion if it has products
category = models.ForeignKey(Category, on_delete=models.PROTECT)
# Category has products → Cannot delete category

# SET_NULL: Set to NULL when category deleted
category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
# Category deleted → product.category = None

# SET_DEFAULT: Set to default when category deleted
category = models.ForeignKey(Category, on_delete=models.SET_DEFAULT, default=1)
# Category deleted → product.category = default category

# SET(): Set to value from function
def get_default_category():
    return Category.objects.get(name='Uncategorized')

category = models.ForeignKey(Category, on_delete=models.SET(get_default_category))

# DO_NOTHING: Do nothing (dangerous - can break referential integrity)
category = models.ForeignKey(Category, on_delete=models.DO_NOTHING)
```

**Usage:**

```python
# Create with relationship
category = Category.objects.create(name='Electronics')
product = Product.objects.create(name='Laptop', category=category)

# Access forward relationship (product → category)
product = Product.objects.get(id=1)
print(product.category.name)  # "Electronics"

# Access reverse relationship (category → products)
category = Category.objects.get(id=1)
products = category.products.all()  # Uses related_name
for product in products:
    print(product.name)

# Filter by relationship
Product.objects.filter(category__name='Electronics')
Product.objects.filter(category__id=1)

# Create without relationship
product = Product.objects.create(name='Misc Item')  # category=None
```

### ManyToManyField

**Use when: Many records link to many records**

Example: Products have multiple tags, tags apply to multiple products

```python
class Tag(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    
    # ManyToMany: Product can have multiple tags
    tags = models.ManyToManyField(
        Tag,
        related_name='products',  # Reverse relation
        blank=True                # Optional relationship
    )
    
    def __str__(self):
        return self.name
```

**What Django Creates:**
```sql
-- Product table
CREATE TABLE product (id, name);

-- Tag table
CREATE TABLE tag (id, name);

-- Junction table (automatic)
CREATE TABLE product_tags (
    id,
    product_id,  -- FK to product
    tag_id       -- FK to tag
);
```

**Usage:**

```python
# Create objects
product = Product.objects.create(name='Laptop')
tag1 = Tag.objects.create(name='Electronics')
tag2 = Tag.objects.create(name='Featured')

# Add tags
product.tags.add(tag1)
product.tags.add(tag2)
# Or multiple at once
product.tags.add(tag1, tag2)

# Remove tags
product.tags.remove(tag1)

# Clear all tags
product.tags.clear()

# Set tags (replace all existing)
product.tags.set([tag1, tag2])

# Get all tags for product
tags = product.tags.all()

# Get all products for tag
tag = Tag.objects.get(name='Featured')
products = tag.products.all()

# Check if has tag
if product.tags.filter(name='Featured').exists():
    print("Product is featured")

# Filter by tags
Product.objects.filter(tags__name='Featured')
Product.objects.filter(tags__in=[tag1, tag2])
```

### ManyToMany with Through Model

**Use when: Need extra data about the relationship**

Example: Student enrolls in courses with enrollment date and grade

```python
class Student(models.Model):
    name = models.CharField(max_length=100)

class Course(models.Model):
    name = models.CharField(max_length=100)
    
    students = models.ManyToManyField(
        Student,
        through='Enrollment',    # Custom junction table
        related_name='courses'
    )

class Enrollment(models.Model):
    """Extra data about student-course relationship"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    
    # Extra fields
    enrolled_date = models.DateField(auto_now_add=True)
    grade = models.CharField(max_length=2, blank=True)
    
    class Meta:
        unique_together = ['student', 'course']  # Student can't enroll twice

# Usage
student = Student.objects.create(name='John')
course = Course.objects.create(name='Django 101')

# Can't use .add() with through model!
# Must create Enrollment directly
enrollment = Enrollment.objects.create(
    student=student,
    course=course,
    grade='A'
)

# Query
enrollments = Enrollment.objects.filter(student=student)
for enrollment in enrollments:
    print(f"{enrollment.course.name}: {enrollment.grade}")

# Get courses for student (works)
courses = student.courses.all()

# Filter by through model fields
Course.objects.filter(enrollment__grade='A')
```

### OneToOneField

**Use when: One record links to exactly one other record**

Example: User has one profile

```python
from django.contrib.auth.models import User

class UserProfile(models.Model):
    # OneToOne: Each user has exactly one profile
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',    # user.profile
        primary_key=True           # Use user_id as primary key
    )
    
    # Extra fields
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"

# Usage
user = User.objects.create_user('john', 'john@example.com')
profile = UserProfile.objects.create(user=user, bio='Hello!')

# Access from user
print(user.profile.bio)  # "Hello!"

# Access from profile
print(profile.user.username)  # "john"

# Auto-create profile when user is created (signal)
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
```

### Self-Referential Relationships

**Use when: Model relates to itself**

Example: Employee has manager (who is also an employee)

```python
class Employee(models.Model):
    name = models.CharField(max_length=100)
    
    # Self-referential ForeignKey
    manager = models.ForeignKey(
        'self',                      # Reference to same model
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates'  # manager.subordinates.all()
    )

# Usage
ceo = Employee.objects.create(name='CEO', manager=None)
manager = Employee.objects.create(name='Manager', manager=ceo)
employee = Employee.objects.create(name='Employee', manager=manager)

# Get manager
print(employee.manager.name)  # "Manager"

# Get subordinates
for subordinate in manager.subordinates.all():
    print(subordinate.name)  # "Employee"

# ManyToMany self-reference (e.g., friends)
class User(models.Model):
    name = models.CharField(max_length=100)
    friends = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=True  # If A friends B, then B friends A
    )

# For asymmetric (like Twitter follow)
class User(models.Model):
    name = models.CharField(max_length=100)
    following = models.ManyToManyField(
        'self',
        symmetrical=False,           # Can follow without being followed back
        related_name='followers',
        blank=True
    )
```

---

## Meta Options

**The Meta class defines metadata about your model.**

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    
    class Meta:
        # Table name in database
        # Default: appname_modelname (products_product)
        db_table = 'products'
        
        # Default ordering for queries
        # '-' means descending
        ordering = ['-created_at', 'name']
        # Product.objects.all() automatically ordered
        
        # Human-readable names (for admin)
        verbose_name = 'Product'
        verbose_name_plural = 'Products'  # Not "Productss"
        
        # Database indexes (for performance)
        indexes = [
            models.Index(fields=['name']),  # Single field
            models.Index(fields=['category', 'price']),  # Composite
            models.Index(fields=['-created_at']),  # With ordering
        ]
        
        # Unique together (combination must be unique)
        unique_together = [
            ['name', 'category']  # Same name OK if different category
        ]
        # Or Django 2.2+
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'category'],
                name='unique_product_per_category'
            )
        ]
        
        # Check constraints (database-level validation)
        constraints = [
            models.CheckConstraint(
                check=models.Q(price__gte=0),
                name='price_non_negative'
            ),
            models.CheckConstraint(
                check=models.Q(stock__gte=0),
                name='stock_non_negative'
            )
        ]
        
        # Permissions (for auth system)
        permissions = [
            ('can_publish', 'Can publish products'),
            ('can_feature', 'Can feature products'),
        ]
        
        # Abstract model (won't create table)
        abstract = False  # Default
        
        # Proxy model (uses same table as parent)
        proxy = False  # Default
        
        # Managed by Django
        managed = True  # Default - Django creates/deletes table
        # Set to False for existing database tables
        
        # Default manager name
        default_manager_name = 'objects'
        
        # Get latest by field
        get_latest_by = 'created_at'
        # Product.objects.latest() uses this field
```

### Common Meta Patterns

```python
# Timestamp mixin
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True  # Won't create table
        ordering = ['-created_at']
        get_latest_by = 'created_at'

# Use in other models
class Product(TimeStampedModel):
    name = models.CharField(max_length=200)
    # Inherits created_at, updated_at, and Meta options

# Read-only model (existing database table)
class LegacyData(models.Model):
    # Fields match existing table
    
    class Meta:
        db_table = 'legacy_table_name'
        managed = False  # Django won't create/delete table

# Unique constraints with conditions (PostgreSQL)
class Product(models.Model):
    name = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    
    class Meta), 'price')
)

# String functions
Product.objects.annotate(lower_name=Lower('name'))
Product.objects.filter(name__iexact=F('name'))

# Calculate field length
Product.objects.annotate(name_length=Length('name'))
```

### Conditional Expressions

```python
from django.db.models import Q, Case, When, Value, IntegerField

class Product(models.Model):
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()

# Case/When - like SQL CASE
Product.objects.annotate(
    price_category=Case(
        When(price__lt=10, then=Value('cheap')),
        When(price__lt=50, then=Value('medium')),
        When(price__gte=50, then=Value('expensive')),
        default=Value('unknown'),
        output_field=models.CharField()
    )
)

# Conditional filtering
products = Product.objects.filter(
    Q(price__lt=100) | Q(stock__gt=50)
)
```

### Generated Fields (Django 5.0+)

```python
from django.db.models import GeneratedField, F

class Product(models.Model):
    price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=4, decimal_places=2)
    
    # Automatically calculated field
    price_with_tax = GeneratedField(
        expression=F('price') * (1 + F('tax_rate')),
        output_field=models.DecimalField(max_digits=10, decimal_places=2),
        db_persist=True  # Store in database
    )

# Always up-to-date, no manual calculation needed
product = Product.objects.create(price=100, tax_rate=0.1)
print(product.price_with_tax)  # 110.00
```

### Database Constraints

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    class Meta:
        constraints = [
            # Check constraint
            models.CheckConstraint(
                check=models.Q(price__gte=0),
                name='price_positive'
            ),
            
            # Discount must be less than price
            models.CheckConstraint(
                check=models.Q(discount_price__lt=F('price')),
                name='discount_less_than_price'
            ),
            
            # Unique constraint
            models.UniqueConstraint(
                fields=['name'],
                name='unique_product_name'
            ),
            
            # Partial unique (PostgreSQL)
            models.UniqueConstraint(
                fields=['name'],
                condition=models.Q(is_active=True),
                name='unique_active_product_name'
            ),
        ]
```

### Full-Text Search (PostgreSQL)

```python
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()

# Basic search
Article.objects.annotate(
    search=SearchVector('title', 'content')
).filter(search='django')

# Ranked search
query = SearchQuery('django')
Article.objects.annotate(
    search=SearchVector('title', 'content'),
    rank=SearchRank(SearchVector('title', 'content'), query)
).filter(search=query).order_by('-rank')
```

### Indexes

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            # Single field index
            models.Index(fields=['name']),
            
            # Composite index
            models.Index(fields=['category', 'price']),
            
            # Index with ordering
            models.Index(fields=['-created_at']),
            
            # Partial index (PostgreSQL)
            models.Index(
                fields=['price'],
                condition=models.Q(is_active=True),
                name='active_products_price_idx'
            ),
            
            # Expression index (PostgreSQL)
            models.Index(
                Lower('name'),
                name='lower_name_idx'
            ),
        ]
```

---

## Best Practices

### 1. Always Define __str__()

```python
# ❌ BAD
class Product(models.Model):
    name = models.CharField(max_length=200)
# Shows: Product object (1)

# ✅ GOOD
class Product(models.Model):
    name = models.CharField(max_length=200)
    
    def __str__(self):
        return self.name
# Shows: iPhone 15 Pro
```

### 2. Use Abstract Base Models

```python
# ✅ GOOD: Reusable timestamps
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class Product(TimeStampedModel):
    name = models.CharField(max_length=200)
```

### 3. Use Appropriate Field Types

```python
# ❌ BAD: Wrong field for money
price = models.FloatField()

# ✅ GOOD: Exact decimal for money
price = models.DecimalField(max_digits=10, decimal_places=2)

# ❌ BAD: CharField for boolean
is_active = models.CharField(max_length=10)  # "yes"/"no"

# ✅ GOOD: BooleanField
is_active = models.BooleanField(default=True)
```

### 4. null vs blank

```python
# String fields
name = models.CharField(max_length=200, blank=True, default='')
# NOT null=True

# Other fields
birth_date = models.DateField(null=True, blank=True)
# null=True needed for non-string fields
```

### 5. Use related_name

```python
# ✅ GOOD
class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'  # category.products.all()
    )

# ❌ BAD
category = models.ForeignKey(Category, on_delete=models.CASCADE)
# category.product_set.all() - not intuitive
```

### 6. Choose Correct on_delete

```python
# CASCADE: Delete related objects
category = models.ForeignKey(Category, on_delete=models.CASCADE)

# PROTECT: Prevent deletion
author = models.ForeignKey(User, on_delete=models.PROTECT)

# SET_NULL: Set to NULL
manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
```

### 7. Add Indexes for Queries

```python
class Product(models.Model):
    sku = models.CharField(max_length=50, db_index=True)  # Searched often
    
    class Meta:
        indexes = [
            models.Index(fields=['category', 'price']),  # Filtered together
        ]
```

### 8. Use Migrations

```bash
# After model changes
python manage.py makemigrations
python manage.py migrate

# Never edit database directly!
```

### 9. Validation

```python
# Call full_clean() before save
def save(self, *args, **kwargs):
    self.full_clean()
    super().save(*args, **kwargs)
```

### 10. Use Custom Managers

```python
# ✅ GOOD: Encapsulate common queries
class ProductQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)
    
    def featured(self):
        return self.filter(is_featured=True)

class Product(models.Model):
    objects = ProductQuerySet.as_manager()

# Clean usage
Product.objects.active().featured()
```

---

## Quick Reference

### Common Field Types
- **CharField** - Short text (max_length required)
- **TextField** - Long text
- **IntegerField** - Whole numbers
- **DecimalField** - Exact decimals (for money)
- **BooleanField** - True/False
- **DateField** - Date only
- **DateTimeField** - Date and time
- **FileField** - File upload
- **ImageField** - Image upload
- **ForeignKey** - Many-to-one
- **ManyToManyField** - Many-to-many
- **OneToOneField** - One-to-one

### Common Field Options
- **null=True** - Database allows NULL
- **blank=True** - Forms allow empty
- **default** - Default value
- **unique=True** - Must be unique
- **db_index=True** - Create index
- **choices** - Limit to specific values

### Common Meta Options
- **db_table** - Custom table name
- **ordering** - Default sort order
- **verbose_name** - Human-readable name
- **indexes** - Database indexes
- **constraints** - Database constraints
- **abstract=True** - Abstract base class

### Common Methods
- **__str__()** - String representation
- **get_absolute_url()** - Object URL
- **save()** - Override save behavior
- **clean()** - Validation logic

This completes the Django Models cheatsheet! 🚀:
        """Metadata about the model"""
        db_table = 'products'
        ordering = ['-created_at']
```

**What Django Creates:**
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

---


**The Meta class defines metadata about your model.**

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    
    class Meta:
        # Table name in database
        # Default: appname_modelname (products_product)
        db_table = 'products'
        
        # Default ordering for queries
        # '-' means descending
        ordering = ['-created_at', 'name']
        # Product.objects.all() automatically ordered
        
        # Human-readable names (for admin)
        verbose_name = 'Product'
        verbose_name_plural = 'Products'  # Not "Productss"
        
        # Database indexes (for performance)
        indexes = [
            models.Index(fields=['name']),  # Single field
            models.Index(fields=['category', 'price']),  # Composite
            models.Index(fields=['-created_at']),  # With ordering
        ]
        
        # Unique together (combination must be unique)
        unique_together = [
            ['name', 'category']  # Same name OK if different category
        ]
        # Or Django 2.2+
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'category'],
                name='unique_product_per_category'
            )
        ]
        
        # Check constraints (database-level validation)
        constraints = [
            models.CheckConstraint(
                check=models.Q(price__gte=0),
                name='price_non_negative'
            ),
            models.CheckConstraint(
                check=models.Q(stock__gte=0),
                name='stock_non_negative'
            )
        ]
        
        # Permissions (for auth system)
        permissions = [
            ('can_publish', 'Can publish products'),
            ('can_feature', 'Can feature products'),
        ]
        
        # Abstract model (won't create table)
        abstract = False  # Default
        
        # Proxy model (uses same table as parent)
        proxy = False  # Default
        
        # Managed by Django
        managed = True  # Default - Django creates/deletes table
        # Set to False for existing database tables
        
        # Default manager name
        default_manager_name = 'objects'
        
        # Get latest by field
        get_latest_by = 'created_at'
        # Product.objects.latest() uses this field
```

### Common Meta Patterns

```python
# Timestamp mixin
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True  # Won't create table
        ordering = ['-created_at']
        get_latest_by = 'created_at'

# Use in other models
class Product(TimeStampedModel):
    name = models.CharField(max_length=200)
    # Inherits created_at, updated_at, and Meta options

# Read-only model (existing database table)
class LegacyData(models.Model):
    # Fields match existing table
    
    class Meta:
        db_table = 'legacy_table_name'
        managed = False  # Django won't create/delete table

# Unique constraints with conditions (PostgreSQL)
class Product(models.Model):
    name = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    
    class Meta