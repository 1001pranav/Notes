# Design Patterns for Beginners: A Complete Guide
## Learning Through a Real Transport Booking System

---

# 📚 Table of Contents

## Part 1: Foundations
- [1. Introduction to Design Patterns](#1-introduction-to-design-patterns)
- [2. Why Design Patterns Matter](#2-why-design-patterns-matter)
- [3. Our Learning Example: Transport Booking System](#3-our-learning-example-transport-booking-system)
- [4. Basic Programming Concepts Review](#4-basic-programming-concepts-review)

## Part 2: Core Design Patterns (Step by Step)
- [5. Dependency Injection Pattern](#5-dependency-injection-pattern)
- [6. Factory Pattern](#6-factory-pattern)
- [7. Builder Pattern](#7-builder-pattern)
- [8. Strategy Pattern](#8-strategy-pattern)
- [9. Command Pattern](#9-command-pattern)
- [10. Observer Pattern](#10-observer-pattern)
- [11. Repository Pattern](#11-repository-pattern)
- [12. Decorator Pattern](#12-decorator-pattern)
- [13. Adapter Pattern](#13-adapter-pattern)

## Part 3: Advanced Concepts
- [14. How Patterns Work Together](#14-how-patterns-work-together)
- [15. Real-World Implementation Examples](#15-real-world-implementation-examples)
- [16. Common Mistakes and How to Avoid Them](#16-common-mistakes-and-how-to-avoid-them)
- [17. When NOT to Use Design Patterns](#17-when-not-to-use-design-patterns)

## Part 4: Practical Application
- [18. Building Your First Pattern](#18-building-your-first-pattern)
- [19. Testing Design Patterns](#19-testing-design-patterns)
- [20. Performance Considerations](#20-performance-considerations)
- [21. Next Steps in Your Learning Journey](#21-next-steps-in-your-learning-journey)

---

# 1. Introduction to Design Patterns

## What Are Design Patterns?

Imagine you're building a house. You wouldn't invent a new way to build doors, windows, or foundations - you'd use proven blueprints that architects have refined over decades. Design patterns are the same thing for software development: they're proven solutions to common programming problems.

### 🏠 Real-World Analogy
Think of design patterns like:
- **Recipes in cooking** - tested ways to combine ingredients
- **Templates in writing** - structures for different types of documents  
- **Blueprints in construction** - proven designs for building components

### 📖 Formal Definition
Design patterns are reusable solutions to commonly occurring problems in software design. They represent best practices and provide a shared vocabulary for developers.

### 🎯 What Design Patterns Are NOT
- **Not code** - They're concepts and structures
- **Not frameworks** - They're smaller, focused solutions
- **Not magic bullets** - They solve specific problems, not everything

## The Three Categories of Design Patterns

### 1. 🏗️ Creational Patterns
**Purpose:** How to create objects efficiently and flexibly

**Examples:**
- Factory Pattern - Creates objects without specifying exact classes
- Builder Pattern - Constructs complex objects step by step
- Singleton Pattern - Ensures only one instance of a class exists

**Real-World Example:** 
In our transport booking app, we need to create different types of payment processors (Stripe, PayPal, etc.) based on user location. A Factory Pattern helps us create the right payment processor without hardcoding the choice.

### 2. 🔧 Structural Patterns  
**Purpose:** How to arrange objects and classes to form larger structures

**Examples:**
- Adapter Pattern - Makes incompatible interfaces work together
- Decorator Pattern - Adds new functionality to objects dynamically
- Repository Pattern - Provides a consistent interface to data storage

**Real-World Example:**
Our app needs to work with different mapping services (Google Maps, Apple Maps). An Adapter Pattern makes them all look the same to our code, even though they have different interfaces.

### 3. 🔄 Behavioral Patterns
**Purpose:** How objects communicate and interact with each other

**Examples:**
- Strategy Pattern - Selects algorithms at runtime
- Observer Pattern - Notifies multiple objects about state changes
- Command Pattern - Encapsulates requests as objects

**Real-World Example:**
When a user books a ride, many things need to happen: send confirmation email, notify the driver, update the database. The Observer Pattern lets all these actions happen automatically without coupling them together.

---

# 2. Why Design Patterns Matter

## 🚫 The Problems Without Design Patterns

### Problem 1: The "Spaghetti Code" Nightmare
```javascript
// BAD: Without patterns - everything is tangled together
class BookingController {
  createBooking(request) {
    // Validation mixed with business logic
    if (!request.pickup || !request.destination) {
      throw new Error('Invalid request');
    }
    
    // Database access mixed with email sending
    const booking = database.save({
      pickup: request.pickup,
      destination: request.destination,
      userId: request.userId
    });
    
    // Email service directly called
    emailService.send(request.userEmail, 'Booking confirmed');
    
    // SMS service directly called
    smsService.send(request.userPhone, 'Your ride is booked');
    
    // Payment processing mixed in
    stripeService.charge(request.paymentToken, booking.amount);
    
    return booking;
  }
}
```

**What's wrong here?**
- Everything is mixed together (validation, database, email, SMS, payment)
- Hard to test individual parts
- Changing email service requires changing this controller
- Adding new notification types means modifying this code
- Impossible to reuse any part of this logic

### Problem 2: Copy-Paste Programming
```javascript
// BAD: Same logic repeated everywhere
class UserController {
  register(userData) {
    // Validation code (repeated in 5 places)
    if (!userData.email || !userData.email.includes('@')) {
      throw new Error('Invalid email');
    }
    // ... more validation
    
    // Email sending (repeated in 10 places)
    const emailConfig = {
      apiKey: process.env.SENDGRID_KEY,
      fromEmail: 'noreply@company.com'
    };
    // ... email sending logic
  }
}

class BookingController {
  createBooking(bookingData) {
    // Same validation code copied here
    if (!bookingData.pickup || !bookingData.destination) {
      throw new Error('Invalid booking data');
    }
    
    // Same email sending code copied here
    const emailConfig = {
      apiKey: process.env.SENDGRID_KEY,
      fromEmail: 'noreply@company.com'
    };
    // ... same email logic
  }
}
```

## ✅ The Solutions With Design Patterns

### Solution 1: Clean, Organized Code
```javascript
// GOOD: With patterns - each responsibility is separate
class BookingController {
  constructor(bookingService, validator, eventBus) {
    this.bookingService = bookingService;  // Dependency Injection
    this.validator = validator;            // Strategy Pattern
    this.eventBus = eventBus;             // Observer Pattern
  }
  
  async createBooking(request) {
    // Single responsibility: validation
    await this.validator.validate(request);
    
    // Single responsibility: business logic
    const booking = await this.bookingService.create(request);
    
    // Single responsibility: notify interested parties
    this.eventBus.publish('BookingCreated', booking);
    
    return booking;
  }
}
```

### Solution 2: Reusable, Maintainable Code
```javascript
// GOOD: Reusable components with patterns
class ValidationFactory {  // Factory Pattern
  createValidator(type) {
    switch(type) {
      case 'user': return new UserValidator();
      case 'booking': return new BookingValidator();
      case 'payment': return new PaymentValidator();
    }
  }
}

class NotificationService {  // Strategy Pattern
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  send(message, recipient) {
    return this.strategy.send(message, recipient);
  }
}
```

## 🎯 Benefits You'll Get

### 1. **Better Communication**
**Before:** "We need to refactor the booking creation method to handle email notifications better."
**After:** "We need to add an Observer to the BookingCreated event."

### 2. **Easier Testing**
```javascript
// Easy to test with patterns
const mockValidator = { validate: jest.fn() };
const mockEventBus = { publish: jest.fn() };
const controller = new BookingController(bookingService, mockValidator, mockEventBus);

// Test just the controller logic
await controller.createBooking(testData);
expect(mockValidator.validate).toHaveBeenCalled();
```

### 3. **Faster Development**
- New features use existing patterns
- Less code to write and maintain
- Fewer bugs due to proven solutions

### 4. **Career Growth**
- Design patterns are industry standard
- Makes you a better developer
- Easier to work in teams
- Valuable skill for senior positions

---

# 3. Our Learning Example: Transport Booking System

## 🚗 What We're Building

Imagine we're building an app like Uber or Lyft. Here's what our system needs to do:

### Core Features
1. **User Management**
   - Users can register and login
   - Users have profiles with preferences
   - Users can add payment methods

2. **Booking Management**  
   - Users can request rides
   - System finds available drivers
   - Drivers can accept/reject rides
   - Track ride progress

3. **Payment Processing**
   - Handle different payment methods (credit card, digital wallet, cash)
   - Process payments after rides
   - Handle refunds and disputes

4. **Communication**
   - Send notifications (email, SMS, push notifications)
   - Real-time updates during rides
   - Chat between driver and passenger

## 🏗️ System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web App       │    │   Driver App    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      API Gateway          │
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
    ┌─────────┴─────────┐ ┌───────┴───────┐ ┌─────────┴─────────┐
    │  User Service     │ │ Booking       │ │ Payment Service   │
    │                   │ │ Service       │ │                   │
    └─────────┬─────────┘ └───────┬───────┘ └─────────┬─────────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      Database             │
                    └───────────────────────────┘
```

## 🎯 Problems We'll Solve

As we build this system, we'll encounter common problems that design patterns solve:

### Problem 1: Object Creation Complexity
**Scenario:** Creating a booking object requires user data, location data, pricing calculation, driver matching, and payment setup.

**Without Patterns:** Massive constructor with 15+ parameters
**With Builder Pattern:** Clean, step-by-step object construction

### Problem 2: Multiple Payment Processors
**Scenario:** Support credit cards (Stripe), local payments (Razorpay), and cash payments.

**Without Patterns:** Lots of if/else statements everywhere
**With Strategy Pattern:** Interchangeable payment algorithms

### Problem 3: Notification Cascade
**Scenario:** When booking is created, send email to user, SMS to driver, push notification to user, update analytics, log to audit system.

**Without Patterns:** Tightly coupled notification code
**With Observer Pattern:** Automatic, decoupled notifications

### Problem 4: External Service Integration
**Scenario:** Integrate with Google Maps, Apple Maps, email services, SMS services, payment gateways.

**Without Patterns:** Different interfaces for each service
**With Adapter Pattern:** Unified interfaces for all external services

---

# 4. Basic Programming Concepts Review

Before we dive into design patterns, let's make sure we understand the fundamental concepts they build upon.

## 🧱 Object-Oriented Programming Fundamentals

### Classes and Objects
```javascript
// Class: Blueprint for creating objects
class Car {
  constructor(brand, model) {
    this.brand = brand;
    this.model = model;
    this.isRunning = false;
  }
  
  start() {
    this.isRunning = true;
    console.log(`${this.brand} ${this.model} is now running`);
  }
}

// Object: Instance of a class
const myCar = new Car('Toyota', 'Camry');
myCar.start(); // Toyota Camry is now running
```

### Inheritance
```javascript
// Base class
class Vehicle {
  constructor(brand) {
    this.brand = brand;
  }
  
  start() {
    console.log(`${this.brand} vehicle started`);
  }
}

// Derived class
class Car extends Vehicle {
  constructor(brand, doors) {
    super(brand);  // Call parent constructor
    this.doors = doors;
  }
  
  honk() {
    console.log('Beep beep!');
  }
}
```

### Encapsulation
```javascript
class BankAccount {
  #balance;  // Private field
  
  constructor(initialBalance) {
    this.#balance = initialBalance;
  }
  
  // Public method to access private data
  getBalance() {
    return this.#balance;
  }
  
  // Public method to modify private data
  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
    }
  }
}
```

### Polymorphism
```javascript
// Different classes with same method name
class Dog {
  makeSound() {
    return 'Woof!';
  }
}

class Cat {
  makeSound() {
    return 'Meow!';
  }
}

// Polymorphic function
function animalSound(animal) {
  return animal.makeSound();  // Works with any animal
}

console.log(animalSound(new Dog()));  // Woof!
console.log(animalSound(new Cat()));  // Meow!
```

## 🔗 Coupling and Cohesion

### Tight Coupling (BAD)
```javascript
// BAD: EmailService directly depends on specific SMTP configuration
class EmailService {
  send(to, subject, body) {
    // Tightly coupled to Gmail SMTP
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'hardcoded@gmail.com',
        pass: 'hardcodedpassword'
      }
    });
    
    transporter.sendMail({ to, subject, body });
  }
}
```

### Loose Coupling (GOOD)
```javascript
// GOOD: EmailService accepts any email provider
class EmailService {
  constructor(emailProvider) {
    this.provider = emailProvider;  // Injected dependency
  }
  
  send(to, subject, body) {
    this.provider.send({ to, subject, body });
  }
}

// Can use any email provider
const gmailProvider = new GmailProvider(config);
const sendgridProvider = new SendgridProvider(config);

const emailService1 = new EmailService(gmailProvider);
const emailService2 = new EmailService(sendgridProvider);
```

### High Cohesion (GOOD)
```javascript
// GOOD: All methods relate to user management
class UserService {
  createUser(userData) { /* ... */ }
  updateUser(userId, updates) { /* ... */ }
  deleteUser(userId) { /* ... */ }
  getUserById(userId) { /* ... */ }
}
```

### Low Cohesion (BAD)
```javascript
// BAD: Methods are unrelated
class MiscService {
  createUser(userData) { /* ... */ }
  calculateDistance(lat1, lon1, lat2, lon2) { /* ... */ }
  formatCurrency(amount) { /* ... */ }
  sendEmail(to, subject) { /* ... */ }
}
```

## 🔧 Interfaces and Abstract Classes

### Interfaces (using TypeScript syntax for clarity)
```typescript
// Interface defines a contract
interface PaymentProcessor {
  processPayment(amount: number, paymentMethod: string): Promise<PaymentResult>;
  refundPayment(transactionId: string): Promise<RefundResult>;
}

// Classes implement the interface
class StripePaymentProcessor implements PaymentProcessor {
  async processPayment(amount: number, paymentMethod: string) {
    // Stripe-specific implementation
    return await stripe.charges.create({
      amount,
      source: paymentMethod
    });
  }
  
  async refundPayment(transactionId: string) {
    // Stripe-specific refund logic
  }
}

class PayPalPaymentProcessor implements PaymentProcessor {
  async processPayment(amount: number, paymentMethod: string) {
    // PayPal-specific implementation
  }
  
  async refundPayment(transactionId: string) {
    // PayPal-specific refund logic
  }
}
```

## 📦 Composition vs Inheritance

### Inheritance (IS-A relationship)
```javascript
class Animal {
  makeSound() {
    console.log('Some sound');
  }
}

class Dog extends Animal {  // Dog IS-A Animal
  makeSound() {
    console.log('Woof!');
  }
}
```

### Composition (HAS-A relationship)
```javascript
class Engine {
  start() {
    console.log('Engine started');
  }
}

class Car {
  constructor() {
    this.engine = new Engine();  // Car HAS-A Engine
  }
  
  start() {
    this.engine.start();
    console.log('Car is ready to drive');
  }
}
```

### Why Composition is Often Better
```javascript
// Problem with inheritance: What if we want a FlyingCar?
class Vehicle { /* ... */ }
class LandVehicle extends Vehicle { /* ... */ }
class AirVehicle extends Vehicle { /* ... */ }
// FlyingCar should extend both? Not possible!

// Solution with composition
class Car {
  constructor() {
    this.movementCapabilities = [
      new LandMovement(),
      new AirMovement()  // Flying car!
    ];
  }
}
```

---

# 5. Dependency Injection Pattern

## 🎯 What is Dependency Injection?

Dependency Injection (DI) is like having a personal assistant who brings you everything you need to do your job, instead of you having to go find and fetch everything yourself.

### 🏠 Real-World Analogy
Imagine you're a chef:

**Without DI (Bad):**
```javascript
class Chef {
  cook() {
    // Chef has to find and get ingredients themselves
    const ingredients = new IngredientStorage().getIngredients();
    const stove = new Stove();
    const pan = new Pan();
    // Chef is responsible for everything!
  }
}
```

**With DI (Good):**
```javascript
class Chef {
  constructor(ingredients, stove, pan) {
    // Assistant brings everything the chef needs
    this.ingredients = ingredients;
    this.stove = stove;
    this.pan = pan;
  }
  
  cook() {
    // Chef can focus on cooking!
    this.stove.heat();
    this.pan.add(this.ingredients);
  }
}
```

## 🔍 The Problem DI Solves

### Without Dependency Injection
```javascript
class BookingService {
  constructor() {
    // Hard-coded dependencies - BAD!
    this.userRepo = new UserRepository();
    this.emailService = new EmailService();
    this.paymentService = new StripePaymentService(); // What if we want PayPal?
    this.database = new MongoDatabase(); // What if we want PostgreSQL?
  }
  
  async createBooking(bookingData) {
    const user = await this.userRepo.findById(bookingData.userId);
    // ...
  }
}

// Problems:
// 1. Hard to test (can't mock dependencies)
// 2. Hard to change (what if we want different payment service?)
// 3. Tight coupling (BookingService knows about specific implementations)
```

### With Dependency Injection
```javascript
class BookingService {
  constructor(userRepository, emailService, paymentService) {
    // Dependencies are injected - GOOD!
    this.userRepo = userRepository;
    this.emailService = emailService;
    this.paymentService = paymentService;
  }
  
  async createBooking(bookingData) {
    const user = await this.userRepo.findById(bookingData.userId);
    // ...
  }
}

// Usage:
const userRepo = new UserRepository();
const emailService = new EmailService();
const paymentService = new StripePaymentService();

const bookingService = new BookingService(userRepo, emailService, paymentService);
```

## 🏗️ Building a DI Container

### Step 1: Simple Manual Injection
```javascript
// Services
class UserRepository {
  async findById(id) {
    return { id, name: 'John Doe' };
  }
}

class EmailService {
  async send(to, subject, body) {
    console.log(`Sending email to ${to}: ${subject}`);
  }
}

class BookingService {
  constructor(userRepository, emailService) {
    this.userRepo = userRepository;
    this.emailService = emailService;
  }
  
  async createBooking(bookingData) {
    const user = await this.userRepo.findById(bookingData.userId);
    await this.emailService.send(user.email, 'Booking Confirmed', 'Your ride is booked!');
    return { id: '123', ...bookingData };
  }
}

// Manual dependency injection
const userRepo = new UserRepository();
const emailService = new EmailService();
const bookingService = new BookingService(userRepo, emailService);
```

### Step 2: Simple DI Container
```javascript
class SimpleContainer {
  constructor() {
    this.services = new Map();
  }
  
  // Register a service
  register(name, factory) {
    this.services.set(name, factory);
  }
  
  // Get a service
  get(name) {
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not found`);
    }
    return factory(this); // Pass container to factory
  }
}

// Usage
const container = new SimpleContainer();

// Register services
container.register('userRepository', () => new UserRepository());
container.register('emailService', () => new EmailService());
container.register('bookingService', (container) => {
  const userRepo = container.get('userRepository');
  const emailService = container.get('emailService');
  return new BookingService(userRepo, emailService);
});

// Use services
const bookingService = container.get('bookingService');
```

### Step 3: Advanced DI Container (From Our Transport App)
```javascript
class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }
  
  // Register singleton (one instance for entire app)
  singleton(name, factory, dependencies = []) {
    this.services.set(name, {
      factory,
      dependencies,
      lifecycle: 'singleton'
    });
  }
  
  // Register transient (new instance every time)
  transient(name, factory, dependencies = []) {
    this.services.set(name, {
      factory,
      dependencies,
      lifecycle: 'transient'
    });
  }
  
  resolve(name) {
    const serviceConfig = this.services.get(name);
    if (!serviceConfig) {
      throw new Error(`Service ${name} not registered`);
    }
    
    // For singletons, return cached instance if it exists
    if (serviceConfig.lifecycle === 'singleton' && this.singletons.has(name)) {
      return this.singletons.get(name);
    }
    
    // Resolve dependencies first
    const resolvedDeps = serviceConfig.dependencies.map(dep => this.resolve(dep));
    
    // Create instance
    const instance = serviceConfig.factory(this, ...resolvedDeps);
    
    // Cache singleton
    if (serviceConfig.lifecycle === 'singleton') {
      this.singletons.set(name, instance);
    }
    
    return instance;
  }
}
```

## 🚗 Real Transport Booking Example

Let's see how DI works in our transport booking system:

```javascript
// Step 1: Define our services
class UserRepository {
  async findById(id) {
    // In real app, this would query database
    return { id, email: 'user@example.com', name: 'John' };
  }
}

class PaymentService {
  constructor(paymentGateway) {
    this.gateway = paymentGateway;
  }
  
  async processPayment(amount, paymentMethod) {
    return await this.gateway.charge(amount, paymentMethod);
  }
}

class StripeGateway {
  async charge(amount, paymentMethod) {
    console.log(`Charging $${amount} via Stripe`);
    return { transactionId: 'stripe_123', status: 'success' };
  }
}

class EmailService {
  async sendBookingConfirmation(user, booking) {
    console.log(`Sending confirmation to ${user.email} for booking ${booking.id}`);
  }
}

class BookingService {
  constructor(userRepository, paymentService, emailService) {
    this.userRepo = userRepository;
    this.paymentService = paymentService;
    this.emailService = emailService;
  }
  
  async createBooking(bookingData) {
    // 1. Get user details
    const user = await this.userRepo.findById(bookingData.userId);
    
    // 2. Process payment
    const payment = await this.paymentService.processPayment(
      bookingData.amount, 
      bookingData.paymentMethod
    );
    
    // 3. Create booking
    const booking = {
      id: 'booking_123',
      userId: user.id,
      amount: bookingData.amount,
      paymentId: payment.transactionId,
      status: 'confirmed'
    };
    
    // 4. Send confirmation
    await this.emailService.sendBookingConfirmation(user, booking);
    
    return booking;
  }
}

// Step 2: Set up DI container
const container = new DIContainer();

// Register dependencies from bottom up
container.singleton('stripeGateway', () => new StripeGateway());
container.singleton('userRepository', () => new UserRepository());
container.singleton('emailService', () => new EmailService());

container.singleton('paymentService', (container) => {
  const gateway = container.resolve('stripeGateway');
  return new PaymentService(gateway);
}, ['stripeGateway']);

container.singleton('bookingService', (container) => {
  const userRepo = container.resolve('userRepository');
  const paymentService = container.resolve('paymentService');
  const emailService = container.resolve('emailService');
  return new BookingService(userRepo, paymentService, emailService);
}, ['userRepository', 'paymentService', 'emailService']);

// Step 3: Use the service
const bookingService = container.resolve('bookingService');

// Create a booking
bookingService.createBooking({
  userId: 'user_123',
  amount: 25.50,
  paymentMethod: 'card_token_xyz'
}).then(booking => {
  console.log('Booking created:', booking);
});
```

## 🧪 Testing with Dependency Injection

DI makes testing incredibly easy:

```javascript
// Mock dependencies for testing
class MockUserRepository {
  async findById(id) {
    return { id, email: 'test@example.com', name: 'Test User' };
  }
}

class MockPaymentService {
  async processPayment(amount, paymentMethod) {
    return { transactionId: 'mock_123', status: 'success' };
  }
}

class MockEmailService {
  async sendBookingConfirmation(user, booking) {
    // Don't actually send email in tests
    console.log('Mock email sent');
  }
}

// Test
describe('BookingService', () => {
  test('should create booking successfully', async () => {
    // Arrange: Set up mocks
    const mockUserRepo = new MockUserRepository();
    const mockPaymentService = new MockPaymentService();
    const mockEmailService = new MockEmailService();
    
    const bookingService = new BookingService(
      mockUserRepo, 
      mockPaymentService, 
      mockEmailService
    );
    
    // Act: Call the method
    const result = await bookingService.createBooking({
      userId: 'user_123',
      amount: 25.50,
      paymentMethod: 'card_token_xyz'
    });
    
    // Assert: Check the result
    expect(result.status).toBe('confirmed');
    expect(result.amount).toBe(25.50);
  });
});
```

## ✅ Benefits of Dependency Injection

### 1. **Easy Testing**
- Mock any dependency
- Test components in isolation
- Fast unit tests

### 2. **Flexible Configuration**
```javascript
// Development: Use mock services
container.register('emailService', () => new MockEmailService());

// Production: Use real services
container.register('emailService', () => new SendGridEmailService());
```

### 3. **Loose Coupling**
- Components don't know about specific implementations
- Easy to swap implementations
- Changes don't cascade through the system

### 4. **Single Responsibility**
- Each class focuses on its main job
- Don't worry about creating dependencies
- Cleaner, more focused code

## ⚠️ Common Mistakes

### 1. **Service Locator Anti-Pattern**
```javascript
// BAD: Service locator (anti-pattern)
class BookingService {
  createBooking(data) {
    const userRepo = ServiceLocator.get('userRepository'); // BAD!
    const emailService = ServiceLocator.get('emailService'); // BAD!
  }
}
```

### 2. **Circular Dependencies**
```javascript
// BAD: A depends on B, B depends on A
class ServiceA {
  constructor(serviceB) { this.serviceB = serviceB; }
}

class ServiceB {
  constructor(serviceA) { this.serviceA = serviceA; }
}

// This creates an infinite loop!
```

### 3. **Over-Injection**
```javascript
// BAD: Too many dependencies
class BookingService {
  constructor(dep1, dep2, dep3, dep4, dep5, dep6, dep7, dep8) {
    // If you need this many dependencies, the class is doing too much!
  }
}
```

---

# 6. Factory Pattern

## 🎯 What is the Factory Pattern?

The Factory Pattern is like having a smart assistant who knows exactly what type of object you need and creates it for you, without you having to know all the complex details of how to make it.

### 🏭 Real-World Analogy
Think of a car factory:
- You don't need to know how to assemble engines, transmissions, or electrical systems
- You just say "I want a sedan" or "I want an SUV"
- The factory handles all the complex assembly and gives you the finished car

### 📖 Formal Definition
The Factory Pattern creates objects without specifying their exact classes. Instead of calling constructors directly, you ask a factory to create the object for you.

## 🔍 The Problem Factory Pattern Solves

### Without Factory Pattern
```javascript
// BAD: Lots of if/else logic scattered everywhere
class PaymentController {
  processPayment(paymentData) {
    let paymentProcessor;
    
    if (paymentData.country === 'US') {
      paymentProcessor = new StripePaymentProcessor(
        process.env.STRIPE_API_KEY,
        process.env.STRIPE_SECRET,
        { currency: 'USD' }
      );
    } else if (paymentData.country === 'IN') {
      paymentProcessor = new RazorpayPaymentProcessor(
        process.env.RAZORPAY_KEY,
        process.env.RAZORPAY_SECRET,
        { currency: 'INR' }
      );
    } else if (paymentData.method === 'cash') {
      paymentProcessor = new CashPaymentProcessor();
    } else {
      throw new Error('Unsupported payment method');
    }
    
    return paymentProcessor.process(paymentData);
  }
}

// This same logic is repeated in multiple places!
// What if we add a new payment method? We have to update everywhere!
```

### With Factory Pattern
```javascript
// GOOD: Clean, centralized object creation
class PaymentController {
  constructor(paymentFactory) {
    this.paymentFactory = paymentFactory;
  }
  
  processPayment(paymentData) {
    const paymentProcessor = this.paymentFactory.create(paymentData);
    return paymentProcessor.process(paymentData);
  }
}

// Adding new payment methods only requires updating the factory
```

## 🏗️ Building Factory Patterns Step by Step

### Step 1: Simple Factory
```javascript
// Step 1: Define the products (payment processors)
class StripePaymentProcessor {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.currency = config.currency;
  }
  
  async process(paymentData) {
    console.log(`Processing $${paymentData.amount} via Stripe`);
    // Stripe-specific logic here
    return { success: true, transactionId: 'stripe_123' };
  }
}

class RazorpayPaymentProcessor {
  constructor(config) {
    this.keyId = config.keyId;
    this.currency = config.currency;
  }
  
  async process(paymentData) {
    console.log(`Processing ₹${paymentData.amount} via Razorpay`);
    // Razorpay-specific logic here
    return { success: true, transactionId: 'razorpay_456' };
  }
}

class CashPaymentProcessor {
  async process(paymentData) {
    console.log(`Cash payment of $${paymentData.amount} recorded`);
    return { success: true, transactionId: 'cash_789' };
  }
}

// Step 2: Create the factory
class PaymentProcessorFactory {
  static create(paymentData) {
    const { country, method } = paymentData;
    
    if (method === 'cash') {
      return new CashPaymentProcessor();
    }
    
    if (country === 'US') {
      return new StripePaymentProcessor({
        apiKey: process.env.STRIPE_API_KEY,
        currency: 'USD'
      });
    }
    
    if (country === 'IN') {
      return new RazorpayPaymentProcessor({
        keyId: process.env.RAZORPAY_KEY_ID,
        currency: 'INR'
      });
    }
    
    throw new Error(`Unsupported payment configuration: ${country}/${method}`);
  }
}

// Step 3: Use the factory
const paymentData = { amount: 100, country: 'US', method: 'card' };
const processor = PaymentProcessorFactory.create(paymentData);
const result = await processor.process(paymentData);
```

### Step 2: Abstract Factory with Registration
```javascript
class PaymentProcessorFactory {
  constructor() {
    this.processors = new Map();
    this.configs = new Map();
  }
  
  // Register a payment processor type
  register(key, processorClass, config) {
    this.processors.set(key, processorClass);
    this.configs.set(key, config);
  }
  
  // Create processor based on payment data
  create(paymentData) {
    const key = this.getProcessorKey(paymentData);
    const ProcessorClass = this.processors.get(key);
    const config = this.configs.get(key);
    
    if (!ProcessorClass) {
      throw new Error(`No processor registered for: ${key}`);
    }
    
    return new ProcessorClass(config);
  }
  
  getProcessorKey(paymentData) {
    if (paymentData.method === 'cash') return 'cash';
    if (paymentData.country === 'US') return 'stripe';
    if (paymentData.country === 'IN') return 'razorpay';
    throw new Error(`Unsupported payment configuration`);
  }
}

// Usage
const factory = new PaymentProcessorFactory();

// Register processors
factory.register('stripe', StripePaymentProcessor, {
  apiKey: process.env.STRIPE_API_KEY,
  currency: 'USD'
});

factory.register('razorpay', RazorpayPaymentProcessor, {
  keyId: process.env.RAZORPAY_KEY_ID,
  currency: 'INR'
});

factory.register('cash', CashPaymentProcessor, {});

// Create processors
const processor = factory.create({ country: 'US', method: 'card' });
```

### Step 3: Factory with Environment Configuration
```javascript
class EnvironmentAwarePaymentFactory {
  constructor(environment = 'production') {
    this.environment = environment;
    this.setupProcessors();
  }
  
  setupProcessors() {
    if (this.environment === 'test') {
      // Use mock processors for testing
      this.processors = {
        stripe: MockStripeProcessor,
        razorpay: MockRazorpayProcessor,
        cash: MockCashProcessor
      };
    } else {
      // Use real processors for production
      this.processors = {
        stripe: StripePaymentProcessor,
        razorpay: RazorpayPaymentProcessor,
        cash: CashPaymentProcessor
      };
    }
  }
  
  create(paymentData) {
    const key = this.getProcessorKey(paymentData);
    const ProcessorClass = this.processors[key];
    
    return new ProcessorClass(this.getConfig(key));
  }
  
  getConfig(processorKey) {
    const configs = {
      stripe: { apiKey: process.env.STRIPE_API_KEY, currency: 'USD' },
      razorpay: { keyId: process.env.RAZORPAY_KEY_ID, currency: 'INR' },
      cash: {}
    };
    
    return configs[processorKey] || {};
  }
  
  getProcessorKey(paymentData) {
    // Same logic as before
  }
}

// Usage in different environments
const productionFactory = new EnvironmentAwarePaymentFactory('production');
const testFactory = new EnvironmentAwarePaymentFactory('test');
```

## 🚗 Complete Transport Booking Example

Let's see how factories work in our complete transport booking system:

```javascript
// Different types of vehicles
class EconomyCar {
  constructor() {
    this.type = 'economy';
    this.baseFare = 10;
    this.perKmRate = 2;
    this.capacity = 4;
  }
  
  calculateFare(distance) {
    return this.baseFare + (distance * this.perKmRate);
  }
}

class PremiumCar {
  constructor() {
    this.type = 'premium';
    this.baseFare = 20;
    this.perKmRate = 3;
    this.capacity = 4;
  }
  
  calculateFare(distance) {
    return this.baseFare + (distance * this.perKmRate);
  }
}

class SUV {
  constructor() {
    this.type = 'suv';
    this.baseFare = 30;
    this.perKmRate = 4;
    this.capacity = 7;
  }
  
  calculateFare(distance) {
    return this.baseFare + (distance * this.perKmRate);
  }
}

// Vehicle Factory
class VehicleFactory {
  static create(vehicleType, options = {}) {
    switch (vehicleType.toLowerCase()) {
      case 'economy':
        return new EconomyCar();
      case 'premium':
        return new PremiumCar();
      case 'suv':
        return new SUV();
      default:
        throw new Error(`Unknown vehicle type: ${vehicleType}`);
    }
  }
  
  static getAvailableTypes() {
    return ['economy', 'premium', 'suv'];
  }
}

// Notification Service Factory
class NotificationServiceFactory {
  constructor() {
    this.services = new Map();
    this.initializeServices();
  }
  
  initializeServices() {
    this.services.set('email', EmailNotificationService);
    this.services.set('sms', SMSNotificationService);
    this.services.set('push', PushNotificationService);
  }
  
  create(type, config) {
    const ServiceClass = this.services.get(type);
    if (!ServiceClass) {
      throw new Error(`Unknown notification service: ${type}`);
    }
    return new ServiceClass(config);
  }
  
  createMultiple(types, config) {
    return types.map(type => this.create(type, config));
  }
}

// Service Factory (from our actual codebase)
class ServiceFactory {
  constructor() {
    this.serviceTypes = new Map();
    this.configurations = new Map();
  }
  
  // Register a service type
  registerServiceType(type, factory, options = {}) {
    this.serviceTypes.set(type, {
      factory,
      dependencies: options.dependencies || [],
      singleton: options.singleton || false
    });
  }
  
  // Create service by type
  create(type, options = {}) {
    const serviceConfig = this.serviceTypes.get(type);
    if (!serviceConfig) {
      throw new Error(`Service type '${type}' is not registered`);
    }
    
    const configuration = this.configurations.get(type) || {};
    const mergedOptions = { ...configuration, ...options };
    
    return serviceConfig.factory(mergedOptions);
  }
  
  // Set default configuration for a service type
  setConfiguration(type, config) {
    this.configurations.set(type, config);
  }
}

// Usage in BookingService
class BookingService {
  constructor(vehicleFactory, notificationFactory, paymentFactory) {
    this.vehicleFactory = vehicleFactory;
    this.notificationFactory = notificationFactory;
    this.paymentFactory = paymentFactory;
  }
  
  async createBooking(bookingData) {
    // 1. Create appropriate vehicle
    const vehicle = this.vehicleFactory.create(bookingData.vehicleType);
    
    // 2. Calculate fare
    const fare = vehicle.calculateFare(bookingData.distance);
    
    // 3. Create payment processor
    const paymentProcessor = this.paymentFactory.create(bookingData.paymentData);
    
    // 4. Process payment
    const paymentResult = await paymentProcessor.process({
      amount: fare,
      ...bookingData.paymentData
    });
    
    // 5. Create notification services
    const notificationServices = this.notificationFactory.createMultiple(
      ['email', 'sms', 'push'],
      { userId: bookingData.userId }
    );
    
    // 6. Send notifications
    const booking = {
      id: `booking_${Date.now()}`,
      vehicleType: vehicle.type,
      fare: fare,
      paymentId: paymentResult.transactionId,
      status: 'confirmed'
    };
    
    for (const service of notificationServices) {
      await service.send('Booking Confirmed', `Your ${vehicle.type} ride is booked!`);
    }
    
    return booking;
  }
}

// Setup factories
const vehicleFactory = VehicleFactory;
const notificationFactory = new NotificationServiceFactory();
const paymentFactory = new PaymentProcessorFactory();

// Create booking service
const bookingService = new BookingService(
  vehicleFactory,
  notificationFactory,
  paymentFactory
);

// Create a booking
const booking = await bookingService.createBooking({
  vehicleType: 'premium',
  distance: 15,
  userId: 'user_123',
  paymentData: { country: 'US', method: 'card', amount: 65 }
});
```

## 🧪 Testing with Factory Pattern

Factories make testing much easier:

```javascript
// Mock implementations for testing
class MockEconomyCar {
  constructor() {
    this.type = 'economy';
    this.baseFare = 5; // Lower fare for testing
    this.perKmRate = 1;
  }
  
  calculateFare(distance) {
    return this.baseFare + (distance * this.perKmRate);
  }
}

class MockPaymentProcessor {
  async process(paymentData) {
    return { success: true, transactionId: 'mock_123' };
  }
}

// Test Factory
class TestVehicleFactory {
  static create(vehicleType) {
    switch (vehicleType) {
      case 'economy':
        return new MockEconomyCar();
      default:
        throw new Error(`Test vehicle type not implemented: ${vehicleType}`);
    }
  }
}

class TestPaymentFactory {
  create(paymentData) {
    return new MockPaymentProcessor();
  }
}

// Test
describe('BookingService', () => {
  test('should create booking with correct fare', async () => {
    // Arrange
    const testVehicleFactory = TestVehicleFactory;
    const testPaymentFactory = new TestPaymentFactory();
    const testNotificationFactory = new MockNotificationFactory();
    
    const bookingService = new BookingService(
      testVehicleFactory,
      testNotificationFactory,
      testPaymentFactory
    );
    
    // Act
    const booking = await bookingService.createBooking({
      vehicleType: 'economy',
      distance: 10,
      userId: 'test_user',
      paymentData: { method: 'test' }
    });
    
    // Assert
    expect(booking.fare).toBe(15); // 5 base + (10 * 1)
    expect(booking.vehicleType).toBe('economy');
    expect(booking.status).toBe('confirmed');
  });
});
```

## ✅ Benefits of Factory Pattern

### 1. **Centralized Object Creation**
- All creation logic in one place
- Easy to modify creation rules
- Consistent object initialization

### 2. **Loose Coupling**
```javascript
// Client code doesn't know about specific classes
const vehicle = vehicleFactory.create('premium'); // Could be any implementation
```

### 3. **Easy to Extend**
```javascript
// Add new vehicle type without changing existing code
class LuxuryCar {
  constructor() {
    this.type = 'luxury';
    this.baseFare = 50;
    this.perKmRate = 6;
  }
}

// Just update the factory
VehicleFactory.addType('luxury', LuxuryCar);
```

### 4. **Environment-Specific Objects**
```javascript
// Different objects for different environments
const factory = new PaymentFactory(process.env.NODE_ENV);
const processor = factory.create(paymentData); // Real or mock based on environment
```

## ⚠️ Common Mistakes

### 1. **Factory Becoming Too Complex**
```javascript
// BAD: Factory with too much logic
class ComplexFactory {
  create(type, options) {
    // 100 lines of complex logic
    // Multiple nested if statements
    // Business logic mixed with creation logic
  }
}

// BETTER: Keep factories simple, delegate complex logic
class SimpleFactory {
  create(type, options) {
    const creator = this.getCreator(type);
    return creator.create(options);
  }
}
```

### 2. **Not Using Interfaces**
```javascript
// BAD: Different objects with different interfaces
const vehicle1 = factory.create('car');     // has calculateFare()
const vehicle2 = factory.create('bike');    // has computeCost()

// GOOD: All objects implement same interface
const vehicle1 = factory.create('car');     // has calculateFare()
const vehicle2 = factory.create('bike');    // has calculateFare()
```

### 3. **Overusing Factory Pattern**
```javascript
// BAD: Factory for simple objects
class StringFactory {
  create(value) {
    return new String(value); // Just use string literal!
  }
}

// GOOD: Use factory for complex objects with multiple types
class DatabaseConnectionFactory {
  create(type, config) {
    // Complex logic to create different database connections
  }
}
```

---

# 7. Builder Pattern

## 🎯 What is the Builder Pattern?

The Builder Pattern is like having a step-by-step instruction manual for building complex objects. Instead of trying to create everything at once (which can be overwhelming and error-prone), you build the object piece by piece in a controlled, logical sequence.

### 🏗️ Real-World Analogy
Think of building a custom computer:

**Without Builder (Bad):**
```javascript
// Confusing! What order do these parameters go in?
const computer = new Computer(
  "Intel i7", "16GB", "512GB SSD", "RTX 3080", 
  "ASUS", "750W", true, false, "RGB", "ATX"
);
// Which parameter is which? Hard to remember!
```

**With Builder (Good):**
```javascript
const computer = new ComputerBuilder()
  .setCPU("Intel i7")
  .setRAM("16GB")
  .setStorage("512GB SSD")
  .setGraphicsCard("RTX 3080")
  .setMotherboard("ASUS")
  .setPowerSupply("750W")
  .enableWifi()
  .setLighting("RGB")
  .build();
// Clear, readable, and impossible to mix up!
```

## 🔍 The Problem Builder Pattern Solves

### Problem 1: Constructor with Too Many Parameters
```javascript
// BAD: Constructor with many parameters
class Booking {
  constructor(
    userId, pickupLat, pickupLng, pickupAddress,
    destLat, destLng, destAddress, vehicleType,
    paymentMethod, specialRequests, isShared,
    scheduledTime, estimatedFare, promoCode,
    contactNumber, emergencyContact, accessibility
  ) {
    // Which parameter is which?!
    // What if I want to skip some optional parameters?
    // Easy to pass parameters in wrong order!
  }
}

// Usage is confusing and error-prone
const booking = new Booking(
  "user123", 40.7128, -74.0060, "123 Main St",
  40.7589, -73.9851, "456 Park Ave", "sedan",
  "credit_card", "Please wait outside", false,
  null, 25.50, "SAVE10", "+1234567890",
  "+0987654321", false
);
```

### Problem 2: Optional Parameters and Validation
```javascript
// BAD: Many constructor overloads or complex validation
class Booking {
  constructor(required, optional1, optional2, optional3) {
    // How do I pass optional3 without optional1 and optional2?
    // Complex validation logic in constructor
    if (!required) throw new Error("Required field missing");
    if (optional1 && !this.validateOptional1(optional1)) {
      throw new Error("Invalid optional1");
    }
    // ... more validation
  }
}
```

### Problem 3: Immutable Objects
```javascript
// BAD: Object can be modified after creation
const booking = new Booking(data);
booking.amount = 1000000; // Accidentally modified!
```

## 🏗️ Building the Builder Pattern Step by Step

### Step 1: Simple Builder
```javascript
class BookingBuilder {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.booking = {
      id: null,
      userId: null,
      pickup: {},
      destination: {},
      vehicle: {},
      payment: {},
      options: {}
    };
    return this;
  }
  
  setUserId(userId) {
    this.booking.userId = userId;
    return this; // Return this for chaining
  }
  
  setPickupLocation(latitude, longitude, address) {
    this.booking.pickup = { latitude, longitude, address };
    return this;
  }
  
  setDestination(latitude, longitude, address) {
    this.booking.destination = { latitude, longitude, address };
    return this;
  }
  
  setVehicleType(type) {
    this.booking.vehicle.type = type;
    return this;
  }
  
  setPaymentMethod(method) {
    this.booking.payment.method = method;
    return this;
  }
  
  build() {
    // Validation before building
    this.validate();
    
    // Create immutable booking object
    const booking = {
      id: `booking_${Date.now()}`,
      ...this.booking,
      createdAt: new Date(),
      status: 'pending'
    };
    
    // Reset builder for next use
    this.reset();
    
    return Object.freeze(booking); // Make it immutable
  }
  
  validate() {
    if (!this.booking.userId) {
      throw new Error('User ID is required');
    }
    if (!this.booking.pickup.latitude) {
      throw new Error('Pickup location is required');
    }
    if (!this.booking.destination.latitude) {
      throw new Error('Destination is required');
    }
  }
}

// Usage
const booking = new BookingBuilder()
  .setUserId('user123')
  .setPickupLocation(40.7128, -74.0060, '123 Main St')
  .setDestination(40.7589, -73.9851, '456 Park Ave')
  .setVehicleType('sedan')
  .setPaymentMethod('credit_card')
  .build();
```

### Step 2: Builder with Advanced Features
```javascript
class AdvancedBookingBuilder {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.booking = {
      userId: null,
      pickup: {},
      destination: {},
      vehicle: { type: 'economy' }, // Default value
      payment: { method: 'credit_card' }, // Default value
      schedule: { immediate: true },
      options: {
        shared: false,
        accessibility: false,
        petFriendly: false
      },
      contacts: {},
      preferences: {}
    };
    return this;
  }
  
  // Required methods
  setUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Valid user ID is required');
    }
    this.booking.userId = userId;
    return this;
  }
  
  setPickup(latitude, longitude, address = '') {
    this.validateCoordinates(latitude, longitude);
    this.booking.pickup = { latitude, longitude, address };
    return this;
  }
  
  setDestination(latitude, longitude, address = '') {
    this.validateCoordinates(latitude, longitude);
    this.booking.destination = { latitude, longitude, address };
    return this;
  }
  
  // Optional methods with defaults
  setVehicleType(type) {
    const validTypes = ['economy', 'premium', 'suv', 'luxury'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid vehicle type. Must be one of: ${validTypes.join(', ')}`);
    }
    this.booking.vehicle.type = type;
    return this;
  }
  
  setPaymentMethod(method, details = {}) {
    const validMethods = ['credit_card', 'debit_card', 'digital_wallet', 'cash'];
    if (!validMethods.includes(method)) {
      throw new Error(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
    }
    this.booking.payment = { method, ...details };
    return this;
  }
  
  // Schedule methods
  scheduleForLater(dateTime) {
    if (!(dateTime instanceof Date) || dateTime <= new Date()) {
      throw new Error('Scheduled time must be a future date');
    }
    this.booking.schedule = { immediate: false, scheduledFor: dateTime };
    return this;
  }
  
  scheduleImmediate() {
    this.booking.schedule = { immediate: true };
    return this;
  }
  
  // Options methods
  enableSharing() {
    this.booking.options.shared = true;
    return this;
  }
  
  requireAccessibility() {
    this.booking.options.accessibility = true;
    return this;
  }
  
  allowPets() {
    this.booking.options.petFriendly = true;
    return this;
  }
  
  // Contact methods
  setEmergencyContact(name, phone) {
    this.booking.contacts.emergency = { name, phone };
    return this;
  }
  
  setContactNumber(phone) {
    this.booking.contacts.primary = phone;
    return this;
  }
  
  // Special requests
  addSpecialRequest(request) {
    if (!this.booking.specialRequests) {
      this.booking.specialRequests = [];
    }
    this.booking.specialRequests.push(request);
    return this;
  }
  
  // Validation methods
  validateCoordinates(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error('Coordinates must be numbers');
    }
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
  }
  
  validate() {
    if (!this.booking.userId) {
      throw new Error('User ID is required');
    }
    
    if (!this.booking.pickup.latitude || !this.booking.pickup.longitude) {
      throw new Error('Pickup location coordinates are required');
    }
    
    if (!this.booking.destination.latitude || !this.booking.destination.longitude) {
      throw new Error('Destination coordinates are required');
    }
    
    // Check if pickup and destination are the same
    const pickupCoords = `${this.booking.pickup.latitude},${this.booking.pickup.longitude}`;
    const destCoords = `${this.booking.destination.latitude},${this.booking.destination.longitude}`;
    if (pickupCoords === destCoords) {
      throw new Error('Pickup and destination cannot be the same');
    }
  }
  
  build() {
    this.validate();
    
    const booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...JSON.parse(JSON.stringify(this.booking)), // Deep clone
      createdAt: new Date(),
      status: 'pending',
      estimatedFare: this.calculateEstimatedFare()
    };
    
    this.reset();
    return Object.freeze(booking);
  }
  
  calculateEstimatedFare() {
    // Simple fare calculation (in real app, this would be more complex)
    const baseRate = this.booking.vehicle.type === 'economy' ? 2.5 : 
                     this.booking.vehicle.type === 'premium' ? 3.5 : 4.5;
    
    // Calculate distance (simplified)
    const distance = this.calculateDistance(
      this.booking.pickup.latitude, this.booking.pickup.longitude,
      this.booking.destination.latitude, this.booking.destination.longitude
    );
    
    let fare = 5 + (distance * baseRate); // Base fare + distance rate
    
    // Adjust for options
    if (this.booking.options.accessibility) fare += 2;
    if (this.booking.options.petFriendly) fare += 3;
    if (!this.booking.schedule.immediate) fare += 1; // Scheduled rides cost more
    
    return Math.round(fare * 100) / 100; // Round to 2 decimal places
  }
  
  calculateDistance(lat1, lon1, lat2, lon2) {
    // Simplified distance calculation (use proper geo library in real app)
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
```

### Step 3: Builder with Presets
```javascript
class BookingBuilderWithPresets extends AdvancedBookingBuilder {
  // Preset methods for common configurations
  
  createEconomyRide(userId, pickup, destination) {
    return this.setUserId(userId)
               .setPickup(...pickup)
               .setDestination(...destination)
               .setVehicleType('economy')
               .setPaymentMethod('credit_card')
               .scheduleImmediate();
  }
  
  createLuxuryRide(userId, pickup, destination) {
    return this.setUserId(userId)
               .setPickup(...pickup)
               .setDestination(...destination)
               .setVehicleType('luxury')
               .setPaymentMethod('credit_card')
               .scheduleImmediate();
  }
  
  createAccessibleRide(userId, pickup, destination) {
    return this.setUserId(userId)
               .setPickup(...pickup)
               .setDestination(...destination)
               .setVehicleType('suv')
               .requireAccessibility()
               .setPaymentMethod('credit_card')
               .scheduleImmediate();
  }
  
  createScheduledRide(userId, pickup, destination, scheduledTime) {
    return this.setUserId(userId)
               .setPickup(...pickup)
               .setDestination(...destination)
               .setVehicleType('economy')
               .scheduleForLater(scheduledTime)
               .setPaymentMethod('credit_card');
  }
}
```

## 🚗 Real Transport Booking Examples

### Example 1: Simple Booking
```javascript
const builder = new AdvancedBookingBuilder();

const quickBooking = builder
  .setUserId('user_123')
  .setPickup(40.7128, -74.0060, 'Times Square, NYC')
  .setDestination(40.7589, -73.9851, 'Central Park, NYC')
  .setVehicleType('economy')
  .build();

console.log(quickBooking);
// Output: Complete booking object with estimated fare
```

### Example 2: Complex Booking with All Options
```javascript
const builder = new AdvancedBookingBuilder();

const complexBooking = builder
  .setUserId('user_456')
  .setPickup(40.7128, -74.0060, '123 Broadway, NYC')
  .setDestination(40.7306, -73.9352, 'LaGuardia Airport, NYC')
  .setVehicleType('suv')
  .setPaymentMethod('digital_wallet', { walletId: 'wallet_789' })
  .scheduleForLater(new Date(Date.now() + 2 * 60 * 60 * 1000)) // 2 hours from now
  .requireAccessibility()
  .allowPets()
  .setEmergencyContact('John Doe', '+1234567890')
  .setContactNumber('+0987654321')
  .addSpecialRequest('Please wait at departure gate')
  .addSpecialRequest('Call when arrived')
  .build();

console.log(complexBooking);
```

### Example 3: Using Presets
```javascript
const builder = new BookingBuilderWithPresets();

// Quick economy ride
const economyRide = builder
  .createEconomyRide(
    'user_789',
    [40.7128, -74.0060, 'Downtown'],
    [40.7589, -73.9851, 'Uptown']
  )
  .build();

// Luxury ride with extras
const luxuryRide = builder
  .createLuxuryRide(
    'user_101',
    [40.7128, -74.0060, 'Hotel Manhattan'],
    [40.6782, -73.9442, 'Brooklyn Bridge']
  )
  .setEmergencyContact('Jane Smith', '+1122334455')
  .addSpecialRequest('Champagne service')
  .build();

// Accessible ride
const accessibleRide = builder
  .createAccessibleRide(
    'user_202',
    [40.7505, -73.9934, 'Hospital'],
    [40.7282, -73.7949, 'JFK Airport']
  )
  .build();
```

## 🧪 Testing Builder Pattern

The Builder pattern makes testing much easier:

```javascript
describe('BookingBuilder', () => {
  let builder;
  
  beforeEach(() => {
    builder = new AdvancedBookingBuilder();
  });
  
  test('should create valid booking with required fields', () => {
    const booking = builder
      .setUserId('test_user')
      .setPickup(40.7128, -74.0060)
      .setDestination(40.7589, -73.9851)
      .build();
    
    expect(booking.userId).toBe('test_user');
    expect(booking.pickup.latitude).toBe(40.7128);
    expect(booking.status).toBe('pending');
    expect(booking.id).toBeDefined();
  });
  
  test('should throw error if required fields missing', () => {
    expect(() => {
      builder.setUserId('test_user').build(); // Missing pickup and destination
    }).toThrow('Pickup location coordinates are required');
  });
  
  test('should calculate fare correctly', () => {
    const booking = builder
      .setUserId('test_user')
      .setPickup(40.7128, -74.0060)
      .setDestination(40.7589, -73.9851) // About 5km distance
      .setVehicleType('economy')
      .build();
    
    expect(booking.estimatedFare).toBeGreaterThan(5); // Base fare
    expect(booking.estimatedFare).toBeLessThan(30); // Reasonable upper limit
  });
  
  test('should handle optional features', () => {
    const booking = builder
      .setUserId('test_user')
      .setPickup(40.7128, -74.0060)
      .setDestination(40.7589, -73.9851)
      .requireAccessibility()
      .allowPets()
      .build();
    
    expect(booking.options.accessibility).toBe(true);
    expect(booking.options.petFriendly).toBe(true);
    expect(booking.estimatedFare).toBeGreaterThan(10); // Higher due to options
  });
  
  test('should create immutable objects', () => {
    const booking = builder
      .setUserId('test_user')
      .setPickup(40.7128, -74.0060)
      .setDestination(40.7589, -73.9851)
      .build();
    
    expect(() => {
      booking.userId = 'hacker';
    }).toThrow(); // Object is frozen
  });
  
  test('builder should be reusable', () => {
    const booking1 = builder
      .setUserId('user1')
      .setPickup(40.7128, -74.0060)
      .setDestination(40.7589, -73.9851)
      .build();
    
    const booking2 = builder
      .setUserId('user2')
      .setPickup(40.7282, -73.7949)
      .setDestination(40.6892, -74.0445)
      .build();
    
    expect(booking1.userId).toBe('user1');
    expect(booking2.userId).toBe('user2');
    expect(booking1.id).not.toBe(booking2.id);
  });
});
```

## ✅ Benefits of Builder Pattern

### 1. **Readable Code**
```javascript
// Instead of this:
const booking = new Booking("user123", 40.7128, -74.0060, "Times Square", 
                           40.7589, -73.9851, "Central Park", "economy", 
                           "credit_card", null, false, null, null);

// You get this:
const booking = new BookingBuilder()
  .setUserId("user123")
  .setPickup(40.7128, -74.0060, "Times Square")
  .setDestination(40.7589, -73.9851, "Central Park")
  .setVehicleType("economy")
  .setPaymentMethod("credit_card")
  .build();
```

### 2. **Flexible Object Construction**
```javascript
// Can skip optional parameters easily
const booking1 = builder.setUserId("user1").setPickup(...).setDestination(...).build();

// Can include optional parameters as needed
const booking2 = builder
  .setUserId("user2")
  .setPickup(...)
  .setDestination(...)
  .requireAccessibility()
  .allowPets()
  .build();
```

### 3. **Validation During Construction**
```javascript
// Validation happens step by step
builder.setUserId(""); // Throws error immediately
builder.setPickup(200, 300); // Throws error for invalid coordinates
```

### 4. **Immutable Objects**
```javascript
const booking = builder.build();
booking.userId = "hacker"; // Throws error - object is frozen
```

### 5. **Reusable Builder**
```javascript
const builder = new BookingBuilder();

const booking1 = builder.setUserId("user1")...build();
const booking2 = builder.setUserId("user2")...build(); // Builder is reset
```

## ⚠️ Common Mistakes

### 1. **Not Making Objects Immutable**
```javascript
// BAD: Object can be modified after creation
build() {
  return this.booking; // Returns mutable object
}

// GOOD: Object is frozen
build() {
  return Object.freeze({...this.booking});
}
```

### 2. **Not Resetting Builder**
```javascript
// BAD: Builder state carries over
build() {
  return this.booking; // Previous state contaminated
}

// GOOD: Builder is reset
build() {
  const result = {...this.booking};
  this.reset();
  return Object.freeze(result);
}
```

### 3. **Overcomplicating Simple Objects**
```javascript
// BAD: Builder for simple objects
class PersonBuilder {
  setName(name) { this.name = name; return this; }
  build() { return { name: this.name }; }
}

// GOOD: Just use object literal
const person = { name: "John" };
```

### 4. **Not Validating in Build Method**
```javascript
// BAD: No validation
build() {
  return this.booking; // Could be invalid
}

// GOOD: Validate before building
build() {
  this.validate();
  return Object.freeze({...this.booking});
}
```

# 8. Strategy Pattern

## 🎯 What is the Strategy Pattern?

The Strategy Pattern is like having different recipes for the same dish. You can choose which recipe (strategy) to use based on what ingredients you have, what diet you're following, or what taste you prefer - but the end result is still the same type of dish.

### 🍳 Real-World Analogy
Think of cooking eggs:
- **Scrambled Strategy** - Mix eggs with milk, cook in pan while stirring
- **Fried Strategy** - Crack eggs directly into hot pan, cook until whites set
- **Boiled Strategy** - Put whole eggs in boiling water for specific time
- **Poached Strategy** - Drop eggs into simmering water with vinegar

All strategies produce cooked eggs, but the method is completely different.

### 📖 Formal Definition
The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. The algorithm can vary independently from the clients that use it.

## 🔍 The Problem Strategy Pattern Solves

### Without Strategy Pattern
```javascript
// BAD: All pricing logic mixed together in one big method
class BookingService {
  calculateFare(bookingData) {
    let fare = 0;
    
    if (bookingData.pricingType === 'standard') {
      fare = 5 + (bookingData.distance * 2); // Base + distance rate
    } else if (bookingData.pricingType === 'surge') {
      fare = 5 + (bookingData.distance * 2);
      fare = fare * bookingData.surgeMultiplier; // Apply surge
    } else if (bookingData.pricingType === 'time-based') {
      fare = 5 + (bookingData.duration * 0.5); // Time-based pricing
    } else if (bookingData.pricingType === 'distance-only') {
      fare = bookingData.distance * 3; // Only distance matters
    } else if (bookingData.pricingType === 'promotional') {
      fare = 5 + (bookingData.distance * 2);
      fare = fare * (1 - bookingData.discountPercent / 100); // Apply discount
    }
    
    // What if we need to add more pricing types?
    // This method becomes huge and hard to maintain!
    
    return fare;
  }
}

// Problems:
// 1. Violates Single Responsibility Principle
// 2. Hard to add new pricing strategies
// 3. Hard to test individual pricing logic
// 4. All pricing logic changes require modifying this method
```

### With Strategy Pattern
```javascript
// GOOD: Each pricing strategy is separate and interchangeable
class BookingService {
  constructor(pricingStrategy) {
    this.pricingStrategy = pricingStrategy;
  }
  
  calculateFare(bookingData) {
    return this.pricingStrategy.calculate(bookingData);
  }
  
  // Can change strategy at runtime
  setPricingStrategy(strategy) {
    this.pricingStrategy = strategy;
  }
}

// Adding new pricing strategies doesn't require changing existing code!
```

## 🏗️ Building Strategy Pattern Step by Step

### Step 1: Define Strategy Interface
```javascript
// Base strategy interface (using JavaScript class)
class PricingStrategy {
  calculate(bookingData) {
    throw new Error('calculate method must be implemented');
  }
  
  getDescription() {
    throw new Error('getDescription method must be implemented');
  }
}
```

### Step 2: Implement Concrete Strategies
```javascript
// Standard pricing strategy
class StandardPricingStrategy extends PricingStrategy {
  constructor(baseFare = 5, perKmRate = 2) {
    super();
    this.baseFare = baseFare;
    this.perKmRate = perKmRate;
  }
  
  calculate(bookingData) {
    const fare = this.baseFare + (bookingData.distance * this.perKmRate);
    return {
      amount: fare,
      breakdown: {
        baseFare: this.baseFare,
        distanceCharge: bookingData.distance * this.perKmRate,
        totalDistance: bookingData.distance
      }
    };
  }
  
  getDescription() {
    return `Standard pricing: $${this.baseFare} base + $${this.perKmRate}/km`;
  }
}

// Surge pricing strategy
class SurgePricingStrategy extends PricingStrategy {
  constructor(baseFare = 5, perKmRate = 2, surgeMultiplier = 1.5) {
    super();
    this.baseFare = baseFare;
    this.perKmRate = perKmRate;
    this.surgeMultiplier = surgeMultiplier;
  }
  
  calculate(bookingData) {
    const baseFare = this.baseFare + (bookingData.distance * this.perKmRate);
    const surgedFare = baseFare * this.surgeMultiplier;
    
    return {
      amount: surgedFare,
      breakdown: {
        baseFare: this.baseFare,
        distanceCharge: bookingData.distance * this.perKmRate,
        surgeMultiplier: this.surgeMultiplier,
        surgeAmount: surgedFare - baseFare,
        totalDistance: bookingData.distance
      }
    };
  }
  
  getDescription() {
    return `Surge pricing: ${this.surgeMultiplier}x multiplier applied`;
  }
}

// Time-based pricing strategy
class TimePricingStrategy extends PricingStrategy {
  constructor(baseFare = 5, perMinuteRate = 0.5) {
    super();
    this.baseFare = baseFare;
    this.perMinuteRate = perMinuteRate;
  }
  
  calculate(bookingData) {
    const fare = this.baseFare + (bookingData.estimatedDuration * this.perMinuteRate);
    
    return {
      amount: fare,
      breakdown: {
        baseFare: this.baseFare,
        timeCharge: bookingData.estimatedDuration * this.perMinuteRate,
        totalMinutes: bookingData.estimatedDuration
      }
    };
  }
  
  getDescription() {
    return `Time-based pricing: $${this.baseFare} base + $${this.perMinuteRate}/minute`;
  }
}

// Promotional pricing strategy
class PromotionalPricingStrategy extends PricingStrategy {
  constructor(baseStrategy, discountPercent) {
    super();
    this.baseStrategy = baseStrategy;
    this.discountPercent = discountPercent;
  }
  
  calculate(bookingData) {
    const baseResult = this.baseStrategy.calculate(bookingData);
    const discountAmount = baseResult.amount * (this.discountPercent / 100);
    const finalAmount = baseResult.amount - discountAmount;
    
    return {
      amount: finalAmount,
      breakdown: {
        ...baseResult.breakdown,
        originalAmount: baseResult.amount,
        discountPercent: this.discountPercent,
        discountAmount: discountAmount
      }
    };
  }
  
  getDescription() {
    return `${this.baseStrategy.getDescription()} with ${this.discountPercent}% discount`;
  }
}
```

### Step 3: Context Class (Strategy User)
```javascript
class FareCalculator {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  calculateFare(bookingData) {
    // Validate input
    this.validateBookingData(bookingData);
    
    // Use strategy to calculate
    const result = this.strategy.calculate(bookingData);
    
    // Add common processing
    result.currency = 'USD';
    result.calculatedAt = new Date();
    result.strategyUsed = this.strategy.constructor.name;
    result.description = this.strategy.getDescription();
    
    return result;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  validateBookingData(data) {
    if (!data.distance && !data.estimatedDuration) {
      throw new Error('Either distance or estimated duration is required');
    }
    if (data.distance < 0) {
      throw new Error('Distance cannot be negative');
    }
    if (data.estimatedDuration < 0) {
      throw new Error('Duration cannot be negative');
    }
  }
}
```

### Step 4: Strategy Factory
```javascript
class PricingStrategyFactory {
  static createStrategy(type, options = {}) {
    switch (type) {
      case 'standard':
        return new StandardPricingStrategy(
          options.baseFare, 
          options.perKmRate
        );
        
      case 'surge':
        return new SurgePricingStrategy(
          options.baseFare,
          options.perKmRate,
          options.surgeMultiplier
        );
        
      case 'time':
        return new TimePricingStrategy(
          options.baseFare,
          options.perMinuteRate
        );
        
      case 'promotional':
        const baseStrategy = this.createStrategy(options.baseType, options.baseOptions);
        return new PromotionalPricingStrategy(
          baseStrategy,
          options.discountPercent
        );
        
      default:
        throw new Error(`Unknown pricing strategy: ${type}`);
    }
  }
  
  static getAvailableStrategies() {
    return ['standard', 'surge', 'time', 'promotional'];
  }
}
```

## 🚗 Complete Transport Booking Example

Let's see how strategies work together in our transport booking system:

```javascript
// Usage in the real booking system
class BookingService {
  constructor() {
    this.fareCalculator = new FareCalculator(new StandardPricingStrategy());
  }
  
  async createBooking(bookingData) {
    // 1. Determine appropriate pricing strategy
    const strategy = this.determinePricingStrategy(bookingData);
    this.fareCalculator.setStrategy(strategy);
    
    // 2. Calculate fare
    const fareDetails = this.fareCalculator.calculateFare(bookingData);
    
    // 3. Create booking with calculated fare
    const booking = {
      id: `booking_${Date.now()}`,
      userId: bookingData.userId,
      pickup: bookingData.pickup,
      destination: bookingData.destination,
      fareDetails: fareDetails,
      status: 'pending',
      createdAt: new Date()
    };
    
    console.log(`Booking created with ${fareDetails.description}`);
    console.log(`Fare: $${fareDetails.amount}`);
    
    return booking;
  }
  
  determinePricingStrategy(bookingData) {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    
    // Check for promotional codes
    if (bookingData.promoCode) {
      const discount = this.getDiscountForPromo(bookingData.promoCode);
      if (discount > 0) {
        return PricingStrategyFactory.createStrategy('promotional', {
          baseType: 'standard',
          discountPercent: discount
        });
      }
    }
    
    // Check for surge pricing (rush hours)
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      const demandLevel = this.getCurrentDemandLevel();
      if (demandLevel > 1.2) {
        return PricingStrategyFactory.createStrategy('surge', {
          surgeMultiplier: demandLevel
        });
      }
    }
    
    // Check if time-based pricing is better for long trips
    if (bookingData.estimatedDuration > 60) { // More than 1 hour
      return PricingStrategyFactory.createStrategy('time');
    }
    
    // Default to standard pricing
    return PricingStrategyFactory.createStrategy('standard');
  }
  
  getDiscountForPromo(promoCode) {
    const promoCodes = {
      'SAVE10': 10,
      'NEWUSER': 20,
      'WEEKEND': 15
    };
    return promoCodes[promoCode] || 0;
  }
  
  getCurrentDemandLevel() {
    // In real app, this would check actual demand data
    return 1.0 + Math.random(); // Simulate demand between 1.0 and 2.0
  }
}

// Example usage
const bookingService = new BookingService();

// Regular booking
const regularBooking = await bookingService.createBooking({
  userId: 'user123',
  pickup: { lat: 40.7128, lng: -74.0060 },
  destination: { lat: 40.7589, lng: -73.9851 },
  distance: 8.5,
  estimatedDuration: 25
});

// Promotional booking
const promoBooking = await bookingService.createBooking({
  userId: 'user456',
  pickup: { lat: 40.7128, lng: -74.0060 },
  destination: { lat: 40.7589, lng: -73.9851 },
  distance: 8.5,
  estimatedDuration: 25,
  promoCode: 'SAVE10'
});

// Long trip (time-based pricing)
const longTripBooking = await bookingService.createBooking({
  userId: 'user789',
  pickup: { lat: 40.7128, lng: -74.0060 },
  destination: { lat: 40.6892, lng: -74.0445 },
  distance: 45,
  estimatedDuration: 75
});
```

## 🎮 Interactive Strategy Example

Let's create a dynamic pricing system that changes strategies based on real-time conditions:

```javascript
class DynamicPricingSystem {
  constructor() {
    this.conditions = {
      weather: 'clear',
      traffic: 'normal',
      events: [],
      demandLevel: 1.0
    };
    
    this.strategies = new Map();
    this.initializeStrategies();
  }
  
  initializeStrategies() {
    // Register different strategies
    this.strategies.set('normal', new StandardPricingStrategy(5, 2));
    this.strategies.set('rainy', new StandardPricingStrategy(7, 2.5)); // Higher base fare in rain
    this.strategies.set('high-demand', new SurgePricingStrategy(5, 2, 1.8));
    this.strategies.set('event-surge', new SurgePricingStrategy(5, 2, 2.5)); // Higher surge for events
    this.strategies.set('promotion', new PromotionalPricingStrategy(
      new StandardPricingStrategy(5, 2), 
      25
    ));
  }
  
  updateConditions(newConditions) {
    this.conditions = { ...this.conditions, ...newConditions };
    console.log('Conditions updated:', this.conditions);
  }
  
  getOptimalStrategy() {
    // Check for events first (highest priority)
    if (this.conditions.events.length > 0) {
      console.log('Event detected, applying event surge pricing');
      return this.strategies.get('event-surge');
    }
    
    // Check for high demand
    if (this.conditions.demandLevel > 1.5) {
      console.log('High demand detected, applying surge pricing');
      return this.strategies.get('high-demand');
    }
    
    // Check weather conditions
    if (this.conditions.weather === 'rain' || this.conditions.weather === 'snow') {
      console.log('Bad weather detected, applying weather pricing');
      return this.strategies.get('rainy');
    }
    
    // Default strategy
    console.log('Normal conditions, applying standard pricing');
    return this.strategies.get('normal');
  }
  
  calculateFare(bookingData) {
    const strategy = this.getOptimalStrategy();
    const calculator = new FareCalculator(strategy);
    return calculator.calculateFare(bookingData);
  }
  
  // Simulate real-time condition changes
  simulateConditionChanges() {
    setInterval(() => {
      // Simulate weather changes
      const weatherOptions = ['clear', 'rain', 'snow', 'cloudy'];
      const newWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      
      // Simulate demand changes
      const newDemand = 0.8 + (Math.random() * 1.5); // Between 0.8 and 2.3
      
      this.updateConditions({
        weather: newWeather,
        demandLevel: newDemand
      });
    }, 10000); // Update every 10 seconds
  }
}

// Usage
const pricingSystem = new DynamicPricingSystem();

// Start simulation
pricingSystem.simulateConditionChanges();

// Calculate fares under different conditions
const bookingData = {
  distance: 10,
  estimatedDuration: 30
};

console.log('Initial fare:', pricingSystem.calculateFare(bookingData));

// Simulate event
pricingSystem.updateConditions({
  events: ['Concert at Madison Square Garden']
});

console.log('Fare during event:', pricingSystem.calculateFare(bookingData));

// Simulate bad weather
pricingSystem.updateConditions({
  weather: 'rain',
  events: []
});

console.log('Fare in rain:', pricingSystem.calculateFare(bookingData));
```

## 📱 Payment Strategy Example

Let's implement payment strategies for our transport booking system:

```javascript
// Payment strategy interface
class PaymentStrategy {
  async processPayment(amount, paymentDetails) {
    throw new Error('processPayment must be implemented');
  }
  
  async refund(transactionId, amount) {
    throw new Error('refund must be implemented');
  }
  
  getPaymentMethodName() {
    throw new Error('getPaymentMethodName must be implemented');
  }
}

// Credit card payment strategy
class CreditCardPaymentStrategy extends PaymentStrategy {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }
  
  async processPayment(amount, paymentDetails) {
    console.log(`Processing $${amount} credit card payment...`);
    
    // Simulate API call to payment processor
    const result = await this.simulatePaymentAPI({
      amount,
      cardNumber: paymentDetails.cardNumber,
      expiryDate: paymentDetails.expiryDate,
      cvv: paymentDetails.cvv
    });
    
    return {
      success: result.success,
      transactionId: result.transactionId,
      fee: amount * 0.029, // 2.9% fee
      method: 'credit_card'
    };
  }
  
  async refund(transactionId, amount) {
    console.log(`Refunding $${amount} to credit card...`);
    return {
      success: true,
      refundId: `refund_${Date.now()}`,
      amount
    };
  }
  
  getPaymentMethodName() {
    return 'Credit Card';
  }
  
  async simulatePaymentAPI(paymentData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      success,
      transactionId: success ? `cc_${Date.now()}` : null,
      error: success ? null : 'Card declined'
    };
  }
}

// Digital wallet payment strategy
class DigitalWalletPaymentStrategy extends PaymentStrategy {
  constructor(walletProvider) {
    super();
    this.walletProvider = walletProvider;
  }
  
  async processPayment(amount, paymentDetails) {
    console.log(`Processing $${amount} ${this.walletProvider} payment...`);
    
    const result = await this.simulateWalletAPI({
      amount,
      walletId: paymentDetails.walletId,
      pin: paymentDetails.pin
    });
    
    return {
      success: result.success,
      transactionId: result.transactionId,
      fee: amount * 0.015, // 1.5% fee (lower than credit card)
      method: 'digital_wallet',
      provider: this.walletProvider
    };
  }
  
  async refund(transactionId, amount) {
    console.log(`Refunding $${amount} to ${this.walletProvider}...`);
    return {
      success: true,
      refundId: `wallet_refund_${Date.now()}`,
      amount
    };
  }
  
  getPaymentMethodName() {
    return `${this.walletProvider} Wallet`;
  }
  
  async simulateWalletAPI(paymentData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = Math.random() > 0.05; // 95% success rate
    
    return {
      success,
      transactionId: success ? `wallet_${Date.now()}` : null,
      error: success ? null : 'Insufficient balance'
    };
  }
}

// Cash payment strategy
class CashPaymentStrategy extends PaymentStrategy {
  async processPayment(amount, paymentDetails) {
    console.log(`Recording $${amount} cash payment...`);
    
    return {
      success: true,
      transactionId: `cash_${Date.now()}`,
      fee: 0, // No processing fee for cash
      method: 'cash'
    };
  }
  
  async refund(transactionId, amount) {
    console.log(`Cash refund of $${amount} to be processed manually`);
    return {
      success: true,
      refundId: `cash_refund_${Date.now()}`,
      amount,
      note: 'Manual processing required'
    };
  }
  
  getPaymentMethodName() {
    return 'Cash';
  }
}

// Payment processor with strategy
class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  async processBookingPayment(booking, paymentDetails) {
    console.log(`Processing payment for booking ${booking.id} using ${this.strategy.getPaymentMethodName()}`);
    
    try {
      const result = await this.strategy.processPayment(booking.fare, paymentDetails);
      
      if (result.success) {
        console.log(`Payment successful: ${result.transactionId}`);
        return {
          ...result,
          bookingId: booking.id,
          processedAt: new Date()
        };
      } else {
        console.error('Payment failed:', result.error);
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error.message);
      throw error;
    }
  }
  
  async refundBooking(booking, reason) {
    console.log(`Processing refund for booking ${booking.id}: ${reason}`);
    
    return await this.strategy.refund(booking.paymentId, booking.fare);
  }
}

// Payment strategy factory
class PaymentStrategyFactory {
  static createStrategy(paymentMethod, options = {}) {
    switch (paymentMethod) {
      case 'credit_card':
        return new CreditCardPaymentStrategy(options.apiKey);
        
      case 'digital_wallet':
        return new DigitalWalletPaymentStrategy(options.provider || 'PayPal');
        
      case 'cash':
        return new CashPaymentStrategy();
        
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  }
}

// Usage example
async function processBookingWithPayment() {
  const booking = {
    id: 'booking_123',
    fare: 25.50
  };
  
  // Try credit card first
  const creditCardStrategy = PaymentStrategyFactory.createStrategy('credit_card', {
    apiKey: 'pk_test_123'
  });
  
  const processor = new PaymentProcessor(creditCardStrategy);
  
  try {
    const result = await processor.processBookingPayment(booking, {
      cardNumber: '4242424242424242',
      expiryDate: '12/25',
      cvv: '123'
    });
    
    console.log('Payment successful:', result);
  } catch (error) {
    console.log('Credit card failed, trying digital wallet...');
    
    // Fallback to digital wallet
    const walletStrategy = PaymentStrategyFactory.createStrategy('digital_wallet', {
      provider: 'PayPal'
    });
    
    processor.setStrategy(walletStrategy);
    
    try {
      const result = await processor.processBookingPayment(booking, {
        walletId: 'wallet_user123',
        pin: '1234'
      });
      
      console.log('Wallet payment successful:', result);
    } catch (walletError) {
      console.log('Wallet failed, offering cash option...');
      
      // Final fallback to cash
      const cashStrategy = PaymentStrategyFactory.createStrategy('cash');
      processor.setStrategy(cashStrategy);
      
      const result = await processor.processBookingPayment(booking, {});
      console.log('Cash payment recorded:', result);
    }
  }
}

// Run the example
processBookingWithPayment();
```

## 🧪 Testing Strategy Pattern

Strategy pattern makes testing much easier because you can test each strategy independently:

```javascript
describe('PricingStrategies', () => {
  const bookingData = {
    distance: 10,
    estimatedDuration: 30
  };
  
  describe('StandardPricingStrategy', () => {
    test('should calculate correct fare', () => {
      const strategy = new StandardPricingStrategy(5, 2);
      const result = strategy.calculate(bookingData);
      
      expect(result.amount).toBe(25); // 5 + (10 * 2)
      expect(result.breakdown.baseFare).toBe(5);
      expect(result.breakdown.distanceCharge).toBe(20);
    });
  });
  
  describe('SurgePricingStrategy', () => {
    test('should apply surge multiplier correctly', () => {
      const strategy = new SurgePricingStrategy(5, 2, 1.5);
      const result = strategy.calculate(bookingData);
      
      expect(result.amount).toBe(37.5); // (5 + 20) * 1.5
      expect(result.breakdown.surgeMultiplier).toBe(1.5);
    });
  });
  
  describe('PromotionalPricingStrategy', () => {
    test('should apply discount correctly', () => {
      const baseStrategy = new StandardPricingStrategy(5, 2);
      const promoStrategy = new PromotionalPricingStrategy(baseStrategy, 20);
      
      const result = promoStrategy.calculate(bookingData);
      
      expect(result.amount).toBe(20); // 25 - (25 * 0.2)
      expect(result.breakdown.discountAmount).toBe(5);
    });
  });
});

describe('PaymentStrategies', () => {
  describe('CreditCardPaymentStrategy', () => {
    test('should process payment with correct fee', async () => {
      const strategy = new CreditCardPaymentStrategy('test_key');
      
      // Mock the API call
      jest.spyOn(strategy, 'simulatePaymentAPI').mockResolvedValue({
        success: true,
        transactionId: 'test_123'
      });
      
      const result = await strategy.processPayment(100, {
        cardNumber: '4242424242424242'
      });
      
      expect(result.success).toBe(true);
      expect(result.fee).toBe(2.9); // 2.9% of 100
      expect(result.method).toBe('credit_card');
    });
  });
  
  describe('CashPaymentStrategy', () => {
    test('should process cash payment with no fee', async () => {
      const strategy = new CashPaymentStrategy();
      
      const result = await strategy.processPayment(100, {});
      
      expect(result.success).toBe(true);
      expect(result.fee).toBe(0);
      expect(result.method).toBe('cash');
    });
  });
});

describe('FareCalculator', () => {
  test('should use injected strategy', () => {
    const mockStrategy = {
      calculate: jest.fn().mockReturnValue({ amount: 50 }),
      getDescription: jest.fn().mockReturnValue('Mock strategy')
    };
    
    const calculator = new FareCalculator(mockStrategy);
    const result = calculator.calculateFare({ distance: 10 });
    
    expect(mockStrategy.calculate).toHaveBeenCalledWith({ distance: 10 });
    expect(result.amount).toBe(50);
  });
  
  test('should allow strategy changes', () => {
    const strategy1 = new StandardPricingStrategy(5, 2);
    const strategy2 = new SurgePricingStrategy(5, 2, 2.0);
    
    const calculator = new FareCalculator(strategy1);
    
    const result1 = calculator.calculateFare({ distance: 10 });
    expect(result1.amount).toBe(25);
    
    calculator.setStrategy(strategy2);
    const result2 = calculator.calculateFare({ distance: 10 });
    expect(result2.amount).toBe(50);
  });
});
```

## ✅ Benefits of Strategy Pattern

### 1. **Open/Closed Principle**
```javascript
// Adding new strategies doesn't require modifying existing code
class WeekendPricingStrategy extends PricingStrategy {
  calculate(bookingData) {
    // New weekend pricing logic
    return { amount: bookingData.distance * 1.5 };
  }
}

// Just plug it in - no existing code changes needed!
const weekendStrategy = new WeekendPricingStrategy();
calculator.setStrategy(weekendStrategy);
```

### 2. **Runtime Strategy Selection**
```javascript
// Choose strategy based on current conditions
function getStrategyForConditions() {
  if (isWeekend()) return new WeekendPricingStrategy();
  if (isDemandHigh()) return new SurgePricingStrategy();
  return new StandardPricingStrategy();
}

const strategy = getStrategyForConditions();
calculator.setStrategy(strategy);
```

### 3. **Easy Testing**
```javascript
// Test each strategy independently
const strategies = [
  new StandardPricingStrategy(),
  new SurgePricingStrategy(),
  new TimePricingStrategy()
];

strategies.forEach(strategy => {
  test(`${strategy.constructor.name} should work correctly`, () => {
    // Test just this strategy
  });
});
```

### 4. **Clean Code Organization**
```javascript
// Each strategy is focused and single-purpose
class StudentDiscountStrategy extends PricingStrategy {
  calculate(bookingData) {
    // Only student discount logic here
  }
}

class SeniorDiscountStrategy extends PricingStrategy {
  calculate(bookingData) {
    // Only senior discount logic here
  }
}
```

## ⚠️ Common Mistakes

### 1. **Strategy Classes Doing Too Much**
```javascript
// BAD: Strategy doing more than just the algorithm
class BadPricingStrategy extends PricingStrategy {
  calculate(bookingData) {
    // Algorithm logic - GOOD
    const fare = this.computeFare(bookingData);
    
    // Database operations - BAD! Not strategy's responsibility
    this.saveToDatabase(fare);
    
    // Email notifications - BAD! Not strategy's responsibility
    this.sendNotification(bookingData.userId, fare);
    
    return fare;
  }
}

// GOOD: Strategy only does the algorithm
class GoodPricingStrategy extends PricingStrategy {
  calculate(bookingData) {
    return this.computeFare(bookingData); // Only the algorithm
  }
}
```

### 2. **Not Using Common Interface**
```javascript
// BAD: Different method names
class StrategyA {
  computePrice(data) { /* ... */ }
}

class StrategyB {
  calculateFare(data) { /* ... */ }
}

// GOOD: Same interface
class StrategyA extends PricingStrategy {
  calculate(data) { /* ... */ }
}

class StrategyB extends PricingStrategy {
  calculate(data) { /* ... */ }
}
```

### 3. **Too Many Small Strategies**
```javascript
// BAD: Over-engineering with tiny strategies
class AddTaxStrategy extends PricingStrategy {
  calculate(data) { return data.amount * 1.08; }
}

class AddTipStrategy extends PricingStrategy {
  calculate(data) { return data.amount * 1.15; }
}

// GOOD: Combine related logic
class TaxAndTipStrategy extends PricingStrategy {
  calculate(data) {
    const withTax = data.amount * 1.08;
    const withTip = withTax * 1.15;
    return withTip;
  }
}
```

### 4. **Forgetting Strategy Selection Logic**
```javascript
// BAD: Client code has to know which strategy to use
if (isRushHour && demandLevel > 1.5 && weather === 'rain') {
  strategy = new SurgePricingStrategy(2.5);
} else if (user.isStudent && dayOfWeek < 5) {
  strategy = new StudentDiscountStrategy();
}
// This logic is repeated everywhere!

// GOOD: Encapsulate strategy selection
class PricingStrategySelector {
  selectStrategy(context) {
    if (context.isRushHour && context.demandLevel > 1.5) {
      return new SurgePricingStrategy(context.surgeMultiplier);
    }
    // ... more logic
  }
}
```

---

# 9. Command Pattern

## 🎯 What is the Command Pattern?

The Command Pattern is like having a universal remote control for your software. Instead of pressing buttons directly on different devices (calling methods directly), you press buttons on the remote (execute commands), and the remote figures out what to do.

### 📺 Real-World Analogy
Think of a universal remote control:
- **Without Command Pattern:** You have to walk to each device (TV, stereo, lights) and manually operate them
- **With Command Pattern:** You press buttons on one remote, and it sends the right signals to the right devices

The remote control encapsulates actions (commands) like "turn on TV", "increase volume", "change channel" without the remote needing to know how each device actually works.

### 📖 Formal Definition
The Command Pattern encapsulates a request as an object, allowing you to parameterize clients with different requests, queue operations, and support undo operations.

## 🔍 The Problem Command Pattern Solves

### Without Command Pattern
```javascript
// BAD: Controllers directly call service methods
class BookingController {
  constructor(bookingService, userService, paymentService, emailService) {
    this.bookingService = bookingService;
    this.userService = userService;
    this.paymentService = paymentService;
    this.emailService = emailService;
  }
  
  async createBooking(req, res) {
    try {
      // Complex business logic mixed with HTTP handling
      const user = await this.userService.findById(req.body.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const booking = await this.bookingService.create(req.body);
      
      // Payment processing
      const payment = await this.paymentService.charge(
        booking.amount, 
        req.body.paymentMethod
      );
      
      if (!payment.success) {
        // Manual cleanup - error prone!
        await this.bookingService.cancel(booking.id);
        return res.status(400).json({ error: 'Payment failed' });
      }
      
      // Update booking
      await this.bookingService.updatePayment(booking.id, payment.id);
      
      // Send notifications
      await this.emailService.sendConfirmation(user.email, booking);
      
      res.json(booking);
    } catch (error) {
      // What if something fails partway? Manual cleanup is complex!
      res.status(500).json({ error: error.message });
    }
  }
}

// Problems:
// 1. Complex business logic in controller
// 2. No way to undo operations
// 3. Hard to test individual steps
// 4. Error handling and rollback is manual and error-prone
// 5. Can't queue or batch operations
// 6. No audit trail of what operations were performed
```

### With Command Pattern
```javascript
// GOOD: Operations are encapsulated as commands
class BookingController {
  constructor(commandBus) {
    this.commandBus = commandBus;
  }
  
  async createBooking(req, res) {
    try {
      const command = new CreateBookingCommand(req.body);
      const booking = await this.commandBus.execute(command);
      
      res.json(booking);
    } catch (error) {
      // Command bus handles rollback automatically!
      res.status(500).json({ error: error.message });
    }
  }
}

// Benefits:
// 1. Simple controller logic
// 2. Automatic undo/rollback
// 3. Easy to test commands individually
// 4. Can queue operations
// 5. Built-in audit trail
// 6. Reusable business logic
```

## 🏗️ Building Command Pattern Step by Step

### Step 1: Command Interface
```javascript
// Base command interface
class Command {
  async execute() {
    throw new Error('execute() method must be implemented');
  }
  
  async undo() {
    throw new Error('undo() method must be implemented');
  }
  
  canUndo() {
    return false; // Override in subclasses if undo is supported
  }
  
  getMetadata() {
    return {
      commandType: this.constructor.name,
      createdAt: new Date(),
      id: this.generateId()
    };
  }
  
  generateId() {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Step 2: Simple Concrete Commands
```javascript
// User registration command
class RegisterUserCommand extends Command {
  constructor(userData) {
    super();
    this.userData = userData;
    this.createdUserId = null;
  }
  
  async execute() {
    console.log('Executing user registration...');
    
    // Validate input
    this.validateUserData();
    
    // Create user (simulate database operation)
    const user = {
      id: `user_${Date.now()}`,
      email: this.userData.email,
      name: this.userData.name,
      createdAt: new Date(),
      status: 'active'
    };
    
    // Store the created user ID for potential undo
    this.createdUserId = user.id;
    
    // Simulate saving to database
    await this.simulateAsyncOperation(500);
    
    console.log(`User ${user.id} created successfully`);
    return user;
  }
  
  async undo() {
    if (!this.createdUserId) {
      throw new Error('Cannot undo: No user was created');
    }
    
    console.log(`Undoing user creation for ${this.createdUserId}...`);
    
    // Simulate deleting from database
    await this.simulateAsyncOperation(300);
    
    console.log(`User ${this.createdUserId} deleted`);
    this.createdUserId = null;
  }
  
  canUndo() {
    return this.createdUserId !== null;
  }
  
  validateUserData() {
    if (!this.userData.email || !this.userData.email.includes('@')) {
      throw new Error('Valid email is required');
    }
    if (!this.userData.name || this.userData.name.trim().length === 0) {
      throw new Error('Name is required');
    }
  }
  
  async simulateAsyncOperation(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Send email command
class SendEmailCommand extends Command {
  constructor(to, subject, body) {
    super();
    this.to = to;
    this.subject = subject;
    this.body = body;
    this.emailId = null;
  }
  
  async execute() {
    console.log(`Sending email to ${this.to}: ${this.subject}`);
    
    // Simulate email API call
    await this.simulateAsyncOperation(1000);
    
    this.emailId = `email_${Date.now()}`;
    
    console.log(`Email sent successfully: ${this.emailId}`);
    return { emailId: this.emailId, status: 'sent' };
  }
  
  async undo() {
    // Note: Usually you can't "undo" an email, but you might want to 
    // send a follow-up email or mark it as recalled
    console.log(`Marking email ${this.emailId} as recalled`);
    await this.simulateAsyncOperation(200);
  }
  
  canUndo() {
    return false; // Emails typically can't be undone
  }
  
  async simulateAsyncOperation(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

### Step 3: Complex Composite Command
```javascript
// Complex booking creation command that orchestrates multiple operations
class CreateBookingCommand extends Command {
  constructor(bookingData) {
    super();
    this.bookingData = bookingData;
    this.createdBooking = null;
    this.processedPayment = null;
    this.sentNotifications = [];
  }
  
  async execute() {
    console.log('Creating booking with payment and notifications...');
    
    try {
      // Step 1: Validate and create booking
      await this.createBooking();
      
      // Step 2: Process payment
      await this.processPayment();
      
      // Step 3: Update booking with payment info
      await this.updateBookingWithPayment();
      
      // Step 4: Send notifications
      await this.sendNotifications();
      
      console.log(`Booking ${this.createdBooking.id} created successfully`);
      return this.createdBooking;
      
    } catch (error) {
      console.error('Booking creation failed:', error.message);
      // The CommandBus will call undo() automatically
      throw error;
    }
  }
  
  async createBooking() {
    this.validateBookingData();
    
    this.createdBooking = {
      id: `booking_${Date.now()}`,
      userId: this.bookingData.userId,
      pickup: this.bookingData.pickup,
      destination: this.bookingData.destination,
      vehicleType: this.bookingData.vehicleType,
      amount: this.calculateAmount(),
      status: 'pending',
      createdAt: new Date()
    };
    
    await this.simulateAsyncOperation(300);
    console.log(`Booking ${this.createdBooking.id} created`);
  }
  
  async processPayment() {
    console.log('Processing payment...');
    
    // Simulate payment processing
    await this.simulateAsyncOperation(1500);
    
    // Simulate random payment failure for demo
    if (Math.random() < 0.2) { // 20% chance of failure
      throw new Error('Payment processing failed');
    }
    
    this.processedPayment = {
      id: `payment_${Date.now()}`,
      amount: this.createdBooking.amount,
      method: this.bookingData.paymentMethod,
      status: 'completed',
      transactionId: `tx_${Date.now()}`
    };
    
    console.log(`Payment ${this.processedPayment.id} processed`);
  }
  
  async updateBookingWithPayment() {
    this.createdBooking.paymentId = this.processedPayment.id;
    this.createdBooking.status = 'confirmed';
    
    await this.simulateAsyncOperation(200);
    console.log('Booking updated with payment info');
  }
  
  async sendNotifications() {
    const notifications = [
      { type: 'email', recipient: this.bookingData.userEmail, message: 'Booking confirmed' },
      { type: 'sms', recipient: this.bookingData.userPhone, message: 'Your ride is booked!' },
      { type: 'push', recipient: this.bookingData.userId, message: 'Booking confirmed' }
    ];
    
    for (const notification of notifications) {
      try {
        await this.simulateAsyncOperation(500);
        const notificationId = `notif_${Date.now()}_${notification.type}`;
        this.sentNotifications.push(notificationId);
        console.log(`${notification.type} notification sent: ${notificationId}`);
      } catch (error) {
        console.warn(`Failed to send ${notification.type} notification:`, error.message);
        // Don't fail the whole operation for notification failures
      }
    }
  }
  
  async undo() {
    console.log('Rolling back booking creation...');
    
    // Undo in reverse order
    
    // 1. Cancel notifications (if possible)
    if (this.sentNotifications.length > 0) {
      console.log('Marking notifications as cancelled...');
      await this.simulateAsyncOperation(200);
    }
    
    // 2. Refund payment
    if (this.processedPayment) {
      console.log(`Refunding payment ${this.processedPayment.id}...`);
      await this.simulateAsyncOperation(1000);
      console.log('Payment refunded');
    }
    
    // 3. Cancel booking
    if (this.createdBooking) {
      console.log(`Cancelling booking ${this.createdBooking.id}...`);
      this.createdBooking.status = 'cancelled';
      await this.simulateAsyncOperation(300);
      console.log('Booking cancelled');
    }
    
    console.log('Rollback completed');
  }
  
  canUndo() {
    return this.createdBooking !== null;
  }
  
  validateBookingData() {
    if (!this.bookingData.userId) throw new Error('User ID is required');
    if (!this.bookingData.pickup) throw new Error('Pickup location is required');
    if (!this.bookingData.destination) throw new Error('Destination is required');
    if (!this.bookingData.paymentMethod) throw new Error('Payment method is required');
  }
  
  calculateAmount() {
    // Simple fare calculation
    const baseAmount = 10;
    const perKmRate = 2;
    const distance = this.calculateDistance(); // Simplified
    return baseAmount + (distance * perKmRate);
  }
  
  calculateDistance() {
    // Simplified distance calculation
    return Math.random() * 20 + 5; // 5-25 km
  }
  
  async simulateAsyncOperation(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

### Step 4: Command Bus (Command Executor)
```javascript
class CommandBus {
  constructor() {
    this.history = [];
    this.queue = [];
    this.isProcessing = false;
    this.maxHistorySize = 100;
  }
  
  // Execute a command immediately
  async execute(command) {
    if (!(command instanceof Command)) {
      throw new Error('Command must extend Command class');
    }
    
    const startTime = Date.now();
    
    try {
      console.log(`Executing ${command.constructor.name}...`);
      
      const result = await command.execute();
      const executionTime = Date.now() - startTime;
      
      // Add to history
      this.addToHistory(command, {
        result,
        executionTime,
        status: 'success',
        timestamp: new Date()
      });
      
      console.log(`${command.constructor.name} completed in ${executionTime}ms`);
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      console.error(`${command.constructor.name} failed after ${executionTime}ms:`, error.message);
      
      // Add failure to history
      this.addToHistory(command, {
        error: error.message,
        executionTime,
        status: 'failed',
        timestamp: new Date()
      });
      
      // Attempt automatic rollback if command supports it
      if (command.canUndo()) {
        try {
          console.log('Attempting automatic rollback...');
          await command.undo();
          console.log('Rollback completed');
        } catch (undoError) {
          console.error('Rollback also failed:', undoError.message);
        }
      }
      
      throw error;
    }
  }
  
  // Queue a command for later execution
  enqueue(command) {
    this.queue.push(command);
    console.log(`${command.constructor.name} queued for execution`);
  }
  
  // Process all queued commands
  async processQueue() {
    if (this.isProcessing) {
      throw new Error('Queue is already being processed');
    }
    
    this.isProcessing = true;
    const results = [];
    
    console.log(`Processing ${this.queue.length} queued commands...`);
    
    try {
      while (this.queue.length > 0) {
        const command = this.queue.shift();
        const result = await this.execute(command);
        results.push(result);
      }
    } finally {
      this.isProcessing = false;
    }
    
    console.log('Queue processing completed');
    return results;
  }
  
  // Undo the last successful command
  async undo() {
    const lastUndoable = this.findLastUndoableCommand();
    
    if (!lastUndoable) {
      throw new Error('No commands available to undo');
    }
    
    const { command, historyEntry } = lastUndoable;
    
    try {
      console.log(`Undoing ${command.constructor.name}...`);
      await command.undo();
      
      // Mark as undone in history
      historyEntry.metadata.undone = true;
      historyEntry.metadata.undoTimestamp = new Date();
      
      console.log('Undo completed');
    } catch (error) {
      console.error('Undo failed:', error.message);
      throw error;
    }
  }
  
  // Rollback multiple commands
  async rollback(count = 1) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      try {
        await this.undo();
        results.push({ success: true });
      } catch (error) {
        results.push({ success: false, error: error.message });
        break; // Stop rollback on first failure
      }
    }
    
    return results;
  }
  
  // Get command execution history
  getHistory(limit = null) {
    const history = [...this.history];
    return limit ? history.slice(-limit) : history;
  }
  
  // Get statistics
  getStats() {
    const totalCommands = this.history.length;
    const successfulCommands = this.history.filter(h => h.metadata.status === 'success').length;
    const failedCommands = this.history.filter(h => h.metadata.status === 'failed').length;
    const undoneCommands = this.history.filter(h => h.metadata.undone).length;
    
    return {
      totalCommands,
      successfulCommands,
      failedCommands,
      undoneCommands,
      successRate: totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0,
      queueSize: this.queue.length,
      isProcessing: this.isProcessing
    };
  }
  
  // Private helper methods
  addToHistory(command, metadata) {
    this.history.push({
      command,
      metadata: {
        ...command.getMetadata(),
        ...metadata
      }
    });
    
    // Maintain history size limit
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }
  
  findLastUndoableCommand() {
    // Find the most recent successful command that hasn't been undone
    for (let i = this.history.length - 1; i >= 0; i--) {
      const historyEntry = this.history[i];
      const { command, metadata } = historyEntry;
      
      if (metadata.status === 'success' && 
          !metadata.undone && 
          command.canUndo()) {
        return { command, historyEntry };
      }
    }
    
    return null;
  }
}
```

## 🚗 Complete Transport Booking Example

Now let's see the Command Pattern in action with our transport booking system:

```javascript
// Usage example with the transport booking system
async function demonstrateCommandPattern() {
  const commandBus = new CommandBus();
  
  console.log('=== Command Pattern Demo ===\n');
  
  // 1. Simple command execution
  console.log('1. Creating a user...');
  const registerCommand = new RegisterUserCommand({
    email: 'john@example.com',
    name: 'John Doe'
  });
  
  try {
    const user = await commandBus.execute(registerCommand);
    console.log('User created:', user.id);
  } catch (error) {
    console.error('User creation failed:', error.message);
  }
  
  console.log('\n2. Creating a booking with payment...');
  
  // 2. Complex command execution
  const bookingCommand = new CreateBookingCommand({
    userId: 'user_123',
    pickup: { lat: 40.7128, lng: -74.0060, address: 'Times Square' },
    destination: { lat: 40.7589, lng: -73.9851, address: 'Central Park' },
    vehicleType: 'sedan',
    paymentMethod: 'credit_card',
    userEmail: 'john@example.com',
    userPhone: '+1234567890'
  });
  
  try {
    const booking = await commandBus.execute(bookingCommand);
    console.log('Booking created successfully:', booking.id);
  } catch (error) {
    console.error('Booking creation failed:', error.message);
    console.log('(Automatic rollback was attempted)');
  }
  
  console.log('\n3. Queueing multiple commands...');
  
  // 3. Queue multiple commands
  const emailCommand1 = new SendEmailCommand(
    'user1@example.com', 
    'Welcome!', 
    'Welcome to our service'
  );
  const emailCommand2 = new SendEmailCommand(
    'user2@example.com', 
    'Promotion', 
    'Special discount for you!'
  );
  
  commandBus.enqueue(emailCommand1);
  commandBus.enqueue(emailCommand2);
  
  const queueResults = await commandBus.processQueue();
  console.log(`Processed ${queueResults.length} queued commands`);
  
  console.log('\n4. Command history and statistics...');
  
  // 4. Show command history and stats
  const stats = commandBus.getStats();
  console.log('Command Bus Statistics:');
  console.log(`- Total commands: ${stats.totalCommands}`);
  console.log(`- Successful: ${stats.successfulCommands}`);
  console.log(`- Failed: ${stats.failedCommands}`);
  console.log(`- Success rate: ${stats.successRate.toFixed(1)}%`);
  
  const recentHistory = commandBus.getHistory(3);
  console.log('\nRecent command history:');
  recentHistory.forEach((entry, index) => {
    const { command, metadata } = entry;
    console.log(`${index + 1}. ${command.constructor.name} - ${metadata.status} (${metadata.executionTime}ms)`);
  });
  
  console.log('\n5. Demonstrating undo functionality...');
  
  // 5. Undo demonstration
  try {
    await commandBus.undo();
    console.log('Last command undone successfully');
  } catch (error) {
    console.log('No commands to undo or undo failed:', error.message);
  }
  
  console.log('\n=== Demo Complete ===');
}

// Run the demonstration
demonstrateCommandPattern();
```

## 📱 Advanced Command Features

### Command with Parameters and Validation
```javascript
class UpdateUserProfileCommand extends Command {
  constructor(userId, updates, validationRules = {}) {
    super();
    this.userId = userId;
    this.updates = updates;
    this.validationRules = validationRules;
    this.previousData = null;
  }
  
  async execute() {
    // Validate updates
    this.validateUpdates();
    
    // Get current data for potential undo
    this.previousData = await this.getCurrentUserData();
    
    // Apply updates
    const updatedUser = await this.applyUpdates();
    
    return updatedUser;
  }
  
  async undo() {
    if (!this.previousData) {
      throw new Error('Cannot undo: No previous data available');
    }
    
    // Restore previous data
    await this.restoreUserData(this.previousData);
  }
  
  canUndo() {
    return this.previousData !== null;
  }
  
  validateUpdates() {
    if (this.updates.email && !this.isValidEmail(this.updates.email)) {
      throw new Error('Invalid email format');
    }
    
    if (this.updates.age && (this.updates.age < 18 || this.updates.age > 120)) {
      throw new Error('Age must be between 18 and 120');
    }
  }
  
  isValidEmail(email) {
    return email.includes('@') && email.includes('.');
  }
  
  async getCurrentUserData() {
    // Simulate database fetch
    return {
      id: this.userId,
      name: 'Current Name',
      email: 'current@email.com',
      age: 25
    };
  }
  
  async applyUpdates() {
    // Simulate database update
    return {
      ...this.previousData,
      ...this.updates,
      updatedAt: new Date()
    };
  }
  
  async restoreUserData(data) {
    // Simulate database restore
    console.log(`Restoring user ${this.userId} to previous state`);
  }
}
```

### Scheduled Command Execution
```javascript
class ScheduledCommandBus extends CommandBus {
  constructor() {
    super();
    this.scheduledCommands = [];
    this.startScheduler();
  }
  
  scheduleCommand(command, executeAt) {
    if (!(executeAt instanceof Date)) {
      throw new Error('executeAt must be a Date object');
    }
    
    if (executeAt <= new Date()) {
      throw new Error('Cannot schedule commands in the past');
    }
    
    this.scheduledCommands.push({
      command,
      executeAt,
      id: `scheduled_${Date.now()}`,
      status: 'scheduled'
    });
    
    console.log(`Command ${command.constructor.name} scheduled for ${executeAt}`);
  }
  
  scheduleCommandIn(command, delayMs) {
    const executeAt = new Date(Date.now() + delayMs);
    this.scheduleCommand(command, executeAt);
  }
  
  cancelScheduledCommand(commandId) {
    const index = this.scheduledCommands.findIndex(sc => sc.id === commandId);
    if (index !== -1) {
      this.scheduledCommands.splice(index, 1);
      console.log(`Scheduled command ${commandId} cancelled`);
      return true;
    }
    return false;
  }
  
  startScheduler() {
    setInterval(() => {
      const now = new Date();
      const readyCommands = this.scheduledCommands.filter(
        sc => sc.status === 'scheduled' && sc.executeAt <= now
      );
      
      readyCommands.forEach(async (scheduledCommand) => {
        try {
          scheduledCommand.status = 'executing';
          await this.execute(scheduledCommand.command);
          scheduledCommand.status = 'completed';
        } catch (error) {
          scheduledCommand.status = 'failed';
          scheduledCommand.error = error.message;
        }
      });
      
      // Clean up completed/failed commands
      this.scheduledCommands = this.scheduledCommands.filter(
        sc => sc.status === 'scheduled'
      );
      
    }, 1000); // Check every second
  }
  
  getScheduledCommands() {
    return [...this.scheduledCommands];
  }
}

// Usage
const scheduledBus = new ScheduledCommandBus();

// Schedule a command to run in 5 seconds
const futureCommand = new SendEmailCommand(
  'user@example.com',
  'Scheduled Email',
  'This email was scheduled!'
);

scheduledBus.scheduleCommandIn(futureCommand, 5000);

// Schedule a command for a specific time
const specificTimeCommand = new SendEmailCommand(
  'admin@example.com',
  'Daily Report',
  'Here is your daily report'
);

const tomorrow = new Date();
tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
tomorrow.setDate(tomorrow.getDate() + 1);

scheduledBus.scheduleCommand(specificTimeCommand, tomorrow);
```

## 🧪 Testing Command Pattern

The Command Pattern makes testing much easier:

```javascript
describe('Command Pattern', () => {
  let commandBus;
  
  beforeEach(() => {
    commandBus = new CommandBus();
  });
  
  describe('RegisterUserCommand', () => {
    test('should create user successfully', async () => {
      const command = new RegisterUserCommand({
        email: 'test@example.com',
        name: 'Test User'
      });
      
      const result = await commandBus.execute(command);
      
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.id).toBeDefined();
    });
    
    test('should throw error for invalid email', async () => {
      const command = new RegisterUserCommand({
        email: 'invalid-email',
        name: 'Test User'
      });
      
      await expect(commandBus.execute(command)).rejects.toThrow('Valid email is required');
    });
    
    test('should support undo operation', async () => {
      const command = new RegisterUserCommand({
        email: 'test@example.com',
        name: 'Test User'
      });
      
      await commandBus.execute(command);
      expect(command.canUndo()).toBe(true);
      
      await commandBus.undo();
      expect(command.canUndo()).toBe(false);
    });
  });
  
  describe('CreateBookingCommand', () => {
    test('should handle payment failure and rollback', async () => {
      // Mock Math.random to force payment failure
      const originalRandom = Math.random;
      Math.random = () => 0.1; // Will cause payment failure
      
      const command = new CreateBookingCommand({
        userId: 'user_123',
        pickup: { lat: 40.7128, lng: -74.0060 },
        destination: { lat: 40.7589, lng: -73.9851 },
        vehicleType: 'sedan',
        paymentMethod: 'credit_card',
        userEmail: 'test@example.com'
      });
      
      await expect(commandBus.execute(command)).rejects.toThrow('Payment processing failed');
      
      // Restore Math.random
      Math.random = originalRandom;
    });
  });
  
  describe('CommandBus', () => {
    test('should maintain command history', async () => {
      const command1 = new RegisterUserCommand({
        email: 'user1@example.com',
        name: 'User 1'
      });
      
      const command2 = new RegisterUserCommand({
        email: 'user2@example.com',
        name: 'User 2'
      });
      
      await commandBus.execute(command1);
      await commandBus.execute(command2);
      
      const history = commandBus.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].metadata.status).toBe('success');
      expect(history[1].metadata.status).toBe('success');
    });
    
    test('should process queued commands', async () => {
      const command1 = new SendEmailCommand('user1@test.com', 'Subject 1', 'Body 1');
      const command2 = new SendEmailCommand('user2@test.com', 'Subject 2', 'Body 2');
      
      commandBus.enqueue(command1);
      commandBus.enqueue(command2);
      
      const results = await commandBus.processQueue();
      
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('sent');
      expect(results[1].status).toBe('sent');
    });
    
    test('should provide accurate statistics', async () => {
      const successCommand = new RegisterUserCommand({
        email: 'success@test.com',
        name: 'Success User'
      });
      
      const failCommand = new RegisterUserCommand({
        email: 'invalid',
        name: 'Fail User'
      });
      
      await commandBus.execute(successCommand);
      
      try {
        await commandBus.execute(failCommand);
      } catch (error) {
        // Expected to fail
      }
      
      const stats = commandBus.getStats();
      expect(stats.totalCommands).toBe(2);
      expect(stats.successfulCommands).toBe(1);
      expect(stats.failedCommands).toBe(1);
      expect(stats.successRate).toBe(50);
    });
  });
});
```

## ✅ Benefits of Command Pattern

### 1. **Separation of Concerns**
```javascript
// Controller only handles HTTP concerns
class BookingController {
  async createBooking(req, res) {
    const command = new CreateBookingCommand(req.body);
    const result = await this.commandBus.execute(command);
    res.json(result);
  }
}

// Business logic is in the command
class CreateBookingCommand {
  async execute() {
    // All the complex business logic here
  }
}
```

### 2. **Built-in Undo/Redo**
```javascript
// Easy undo functionality
await commandBus.execute(command);
if (userChangedMind) {
  await commandBus.undo(); // Automatic rollback
}
```

### 3. **Audit Trail**
```javascript
// Complete history of all operations
const history = commandBus.getHistory();
history.forEach(entry => {
  console.log(`${entry.command.constructor.name} - ${entry.metadata.status} at ${entry.metadata.timestamp}`);
});
```

### 4. **Queue Operations**
```javascript
// Queue commands for batch processing
commands.forEach(cmd => commandBus.enqueue(cmd));
await commandBus.processQueue(); // Process all at once
```

### 5. **Easy Testing**
```javascript
// Test commands in isolation
const command = new CreateBookingCommand(testData);
const result = await command.execute();
// No need to mock HTTP layer or database
```

## ⚠️ Common Mistakes

### 1. **Commands Doing Too Much**
```javascript
// BAD: Command handling HTTP concerns
class BadCreateBookingCommand extends Command {
  async execute() {
    // Business logic
    const booking = this.createBooking();
    
    // HTTP concerns - WRONG!
    this.res.json(booking);
    
    return booking;
  }
}

// GOOD: Command only does business logic
class GoodCreateBookingCommand extends Command {
  async execute() {
    return this.createBooking(); // Only business logic
  }
}
```

### 2. **Not Implementing Proper Undo**
```javascript
// BAD: Incomplete undo
class BadCommand extends Command {
  async undo() {
    console.log('Undo called'); // Doesn't actually undo anything!
  }
}

// GOOD: Proper undo implementation
class GoodCommand extends Command {
  async execute() {
    this.previousState = await this.getCurrentState();
    await this.makeChanges();
  }
  
  async undo() {
    await this.restoreState(this.previousState);
  }
}
```

### 3. **Ignoring Command Failure**
```javascript
// BAD: Not handling command failures
try {
  await commandBus.execute(command);
} catch (error) {
  // Ignore error - BAD!
}

// GOOD: Proper error handling
try {
  await commandBus.execute(command);
} catch (error) {
  // Log error, notify user, take corrective action
  logger.error('Command failed:', error);
  await this.handleCommandFailure(error);
}
```

### 4. **Making Commands Stateful**
```javascript
// BAD: Command with shared state
class BadCommand extends Command {
  static sharedCounter = 0; // Shared state - BAD!
  
  async execute() {
    BadCommand.sharedCounter++; // Commands affecting each other
  }
}

// GOOD: Commands are independent
class GoodCommand extends Command {
  constructor(data) {
    this.data = data; // Instance state only
  }
  
  async execute() {
    // Only uses instance data
    return this.processData(this.data);
  }
}
```

# 10. Observer Pattern

## 🎯 What is the Observer Pattern?

The Observer Pattern is like having a news subscription service. When something important happens (like breaking news), all the subscribers automatically get notified. You don't have to manually call each subscriber - the system does it for you.

### 📺 Real-World Analogy
Think of YouTube subscriptions:
- **Subject:** A YouTube channel (like "TechChannel")
- **Observers:** People who subscribed to the channel
- **Event:** New video is uploaded
- **Notification:** All subscribers get notified automatically

When TechChannel uploads a new video, YouTube automatically sends notifications to all subscribers. The channel doesn't need to know who the subscribers are or how to contact them - the system handles it.

### 📖 Formal Definition
The Observer Pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

## 🔍 The Problem Observer Pattern Solves

### Without Observer Pattern
```javascript
// BAD: Tightly coupled notification system
class BookingService {
  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.pushNotificationService = new PushNotificationService();
    this.analyticsService = new AnalyticsService();
    this.auditService = new AuditService();
  }
  
  async createBooking(bookingData) {
    const booking = await this.saveBooking(bookingData);
    
    // Manual notifications - TIGHTLY COUPLED!
    await this.emailService.sendConfirmation(booking.userEmail, booking);
    await this.smsService.sendConfirmation(booking.userPhone, booking);
    await this.pushNotificationService.sendConfirmation(booking.userId, booking);
    await this.analyticsService.recordBookingCreated(booking);
    await this.auditService.logBookingCreated(booking);
    
    // What if we want to add more notifications?
    // What if some notifications fail?
    // What if we want conditional notifications?
    
    return booking;
  }
}

// Problems:
// 1. BookingService knows about all notification services
// 2. Adding new notifications requires modifying this class
// 3. All notifications are mandatory
// 4. Hard to test individual notification logic
// 5. If one notification fails, others might not run
```

### With Observer Pattern
```javascript
// GOOD: Decoupled notification system
class BookingService {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }
  
  async createBooking(bookingData) {
    const booking = await this.saveBooking(bookingData);
    
    // Just publish the event - observers handle the rest!
    await this.eventBus.publish('BookingCreated', booking);
    
    return booking;
  }
}

// Benefits:
// 1. BookingService doesn't know about notification services
// 2. Adding new notifications doesn't require changing this class
// 3. Notifications can be conditional
// 4. Easy to test each notification independently
// 5. Notifications run independently - failures don't affect others
```

## 🏗️ Building Observer Pattern Step by Step

### Step 1: Simple Event System
```javascript
// Simple event emitter
class EventEmitter {
  constructor() {
    this.listeners = new Map(); // Map<eventName, Array<callback>>
  }
  
  // Subscribe to an event
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    
    this.listeners.get(eventName).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  // Emit an event
  emit(eventName, data) {
    const callbacks = this.listeners.get(eventName) || [];
    
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }
  
  // Remove all listeners for an event
  removeAllListeners(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}

// Usage
const eventEmitter = new EventEmitter();

// Subscribe to events
eventEmitter.on('userRegistered', (user) => {
  console.log(`Welcome email sent to ${user.email}`);
});

eventEmitter.on('userRegistered', (user) => {
  console.log(`Analytics recorded for user ${user.id}`);
});

// Emit an event
eventEmitter.emit('userRegistered', { id: '123', email: 'user@example.com' });
```

### Step 2: Advanced Event Bus
```javascript
class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  // Subscribe with options
  subscribe(eventName, handler, options = {}) {
    const { priority = 0, filter = null, once = false } = options;
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    
    const listenerInfo = {
      handler,
      priority,
      filter,
      once,
      id: this.generateId()
    };
    
    const listeners = this.listeners.get(eventName);
    listeners.push(listenerInfo);
    
    // Sort by priority (higher priority first)
    listeners.sort((a, b) => b.priority - a.priority);
    
    return listenerInfo.id; // Return ID for unsubscribing
  }
  
  // Subscribe for one-time event
  once(eventName, handler, options = {}) {
    return this.subscribe(eventName, handler, { ...options, once: true });
  }
  
  // Unsubscribe
  unsubscribe(eventName, handlerOrId) {
    const listeners = this.listeners.get(eventName);
    if (!listeners) return false;
    
    const index = typeof handlerOrId === 'string'
      ? listeners.findIndex(l => l.id === handlerOrId)
      : listeners.findIndex(l => l.handler === handlerOrId);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  // Publish event
  async publish(eventName, data = null) {
    const listeners = this.listeners.get(eventName) || [];
    const results = [];
    
    for (const listenerInfo of listeners) {
      try {
        // Apply filter if present
        if (listenerInfo.filter && !listenerInfo.filter(data)) {
          continue;
        }
        
        // Call handler
        const result = await listenerInfo.handler(data);
        results.push({ success: true, result });
        
        // Remove if it's a one-time listener
        if (listenerInfo.once) {
          this.unsubscribe(eventName, listenerInfo.id);
        }
        
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return {
      eventName,
      data,
      totalListeners: listeners.length,
      results
    };
  }
  
  generateId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Step 3: Transport Booking Event Handlers
```javascript
// Event handlers for our transport booking system

// Email notification handler
class EmailNotificationHandler {
  constructor(emailService) {
    this.emailService = emailService;
  }
  
  async handleBookingCreated(booking) {
    console.log('📧 Sending booking confirmation email...');
    
    const emailContent = {
      to: booking.userEmail,
      subject: 'Booking Confirmed',
      body: `Your ${booking.vehicleType} ride is confirmed! Booking ID: ${booking.id}`
    };
    
    await this.emailService.send(emailContent);
    console.log(`✅ Email sent to ${booking.userEmail}`);
  }
  
  async handleBookingCancelled(booking) {
    console.log('📧 Sending booking cancellation email...');
    
    const emailContent = {
      to: booking.userEmail,
      subject: 'Booking Cancelled',
      body: `Your booking ${booking.id} has been cancelled. Any charges will be refunded.`
    };
    
    await this.emailService.send(emailContent);
  }
}

// SMS notification handler
class SMSNotificationHandler {
  constructor(smsService) {
    this.smsService = smsService;
  }
  
  async handleBookingCreated(booking) {
    console.log('📱 Sending booking confirmation SMS...');
    
    const message = `Your ride is confirmed! Vehicle: ${booking.vehicleType}, ID: ${booking.id}`;
    
    await this.smsService.send(booking.userPhone, message);
    console.log(`✅ SMS sent to ${booking.userPhone}`);
  }
  
  async handleDriverAssigned(booking) {
    console.log('📱 Sending driver assignment SMS...');
    
    const message = `Driver assigned! ${booking.driver.name} is coming to pick you up.`;
    
    await this.smsService.send(booking.userPhone, message);
  }
}

// Analytics handler
class AnalyticsHandler {
  constructor(analyticsService) {
    this.analyticsService = analyticsService;
  }
  
  async handleBookingCreated(booking) {
    console.log('📊 Recording booking analytics...');
    
    await this.analyticsService.track('booking_created', {
      bookingId: booking.id,
      vehicleType: booking.vehicleType,
      amount: booking.amount,
      userId: booking.userId,
      timestamp: new Date()
    });
    
    console.log('✅ Analytics recorded');
  }
  
  async handleBookingCompleted(booking) {
    console.log('📊 Recording booking completion analytics...');
    
    await this.analyticsService.track('booking_completed', {
      bookingId: booking.id,
      duration: booking.duration,
      rating: booking.rating,
      completedAt: new Date()
    });
  }
}

// Audit handler
class AuditHandler {
  constructor(auditService) {
    this.auditService = auditService;
  }
  
  async handleAnyEvent(eventName, data) {
    console.log('📝 Logging audit trail...');
    
    await this.auditService.log({
      event: eventName,
      data: data,
      timestamp: new Date(),
      source: 'booking_system'
    });
    
    console.log(`✅ Audit logged for ${eventName}`);
  }
}

// Driver matching handler
class DriverMatchingHandler {
  constructor(driverService) {
    this.driverService = driverService;
  }
  
  async handleBookingCreated(booking) {
    console.log('🚗 Finding nearby drivers...');
    
    const nearbyDrivers = await this.driverService.findNearbyDrivers(
      booking.pickup.lat, 
      booking.pickup.lng, 
      booking.vehicleType
    );
    
    if (nearbyDrivers.length > 0) {
      const assignedDriver = nearbyDrivers[0];
      booking.driver = assignedDriver;
      
      // Publish driver assigned event
      // This will trigger SMS to user, notification to driver, etc.
      await eventBus.publish('DriverAssigned', booking);
    }
    
    console.log('✅ Driver matching completed');
  }
}
```

### Step 4: Complete Transport Booking System with Events
```javascript
// Mock services for demonstration
class MockEmailService {
  async send(emailContent) {
    await this.delay(500);
    console.log(`📧 Email sent: ${emailContent.subject} to ${emailContent.to}`);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class MockSMSService {
  async send(phone, message) {
    await this.delay(300);
    console.log(`📱 SMS sent to ${phone}: ${message}`);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class MockAnalyticsService {
  async track(event, data) {
    await this.delay(200);
    console.log(`📊 Analytics: ${event}`, data);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class MockAuditService {
  async log(auditData) {
    await this.delay(100);
    console.log(`📝 Audit:`, auditData);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class MockDriverService {
  async findNearbyDrivers(lat, lng, vehicleType) {
    await this.delay(1000);
    
    // Simulate finding drivers
    return [
      {
        id: 'driver_123',
        name: 'John Driver',
        vehicleType: vehicleType,
        location: { lat: lat + 0.01, lng: lng + 0.01 }
      }
    ];
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main booking service with observer pattern
class BookingService {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }
  
  async createBooking(bookingData) {
    console.log('🎫 Creating booking...');
    
    // Create booking
    const booking = {
      id: `booking_${Date.now()}`,
      userId: bookingData.userId,
      userEmail: bookingData.userEmail,
      userPhone: bookingData.userPhone,
      pickup: bookingData.pickup,
      destination: bookingData.destination,
      vehicleType: bookingData.vehicleType,
      amount: this.calculateAmount(bookingData),
      status: 'confirmed',
      createdAt: new Date()
    };
    
    // Save to database (simulated)
    await this.saveToDatabase(booking);
    
    console.log(`✅ Booking ${booking.id} created`);
    
    // Publish event - all observers will react automatically!
    await this.eventBus.publish('BookingCreated', booking);
    
    return booking;
  }
  
  async cancelBooking(bookingId) {
    console.log(`❌ Cancelling booking ${bookingId}...`);
    
    // Get booking and update status
    const booking = await this.getBooking(bookingId);
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    
    await this.saveToDatabase(booking);
    
    // Publish cancellation event
    await this.eventBus.publish('BookingCancelled', booking);
    
    return booking;
  }
  
  async completeBooking(bookingId, completionData) {
    console.log(`✅ Completing booking ${bookingId}...`);
    
    const booking = await this.getBooking(bookingId);
    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.duration = completionData.duration;
    booking.rating = completionData.rating;
    
    await this.saveToDatabase(booking);
    
    // Publish completion event
    await this.eventBus.publish('BookingCompleted', booking);
    
    return booking;
  }
  
  calculateAmount(bookingData) {
    // Simple calculation
    return 10 + (Math.random() * 20);
  }
  
  async saveToDatabase(booking) {
    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  async getBooking(bookingId) {
    // Simulate database fetch
    return {
      id: bookingId,
      status: 'confirmed'
    };
  }
}

// Setup the complete system
async function setupTransportBookingSystem() {
  console.log('🚀 Setting up transport booking system with Observer pattern...\n');
  
  // Create event bus
  const eventBus = new EventBus();
  
  // Create services
  const emailService = new MockEmailService();
  const smsService = new MockSMSService();
  const analyticsService = new MockAnalyticsService();
  const auditService = new MockAuditService();
  const driverService = new MockDriverService();
  
  // Create event handlers
  const emailHandler = new EmailNotificationHandler(emailService);
  const smsHandler = new SMSNotificationHandler(smsService);
  const analyticsHandler = new AnalyticsHandler(analyticsService);
  const auditHandler = new AuditHandler(auditService);
  const driverHandler = new DriverMatchingHandler(driverService);
  
  // Subscribe handlers to events
  eventBus.subscribe('BookingCreated', (booking) => emailHandler.handleBookingCreated(booking));
  eventBus.subscribe('BookingCreated', (booking) => smsHandler.handleBookingCreated(booking));
  eventBus.subscribe('BookingCreated', (booking) => analyticsHandler.handleBookingCreated(booking));
  eventBus.subscribe('BookingCreated', (booking) => driverHandler.handleBookingCreated(booking));
  
  eventBus.subscribe('BookingCancelled', (booking) => emailHandler.handleBookingCancelled(booking));
  eventBus.subscribe('BookingCompleted', (booking) => analyticsHandler.handleBookingCompleted(booking));
  
  eventBus.subscribe('DriverAssigned', (booking) => smsHandler.handleDriverAssigned(booking));
  
  // Audit handler listens to ALL events
  const auditEvents = ['BookingCreated', 'BookingCancelled', 'BookingCompleted', 'DriverAssigned'];
  auditEvents.forEach(eventName => {
    eventBus.subscribe(eventName, (data) => auditHandler.handleAnyEvent(eventName, data));
  });
  
  // Create booking service
  const bookingService = new BookingService(eventBus);
  
  return { bookingService, eventBus };
}

// Demonstration
async function demonstrateObserverPattern() {
  const { bookingService } = await setupTransportBookingSystem();
  
  console.log('=== Observer Pattern Demo ===\n');
  
  // Create a booking - watch all the automatic notifications!
  console.log('1. Creating a booking...\n');
  
  const booking = await bookingService.createBooking({
    userId: 'user_123',
    userEmail: 'john@example.com',
    userPhone: '+1234567890',
    pickup: { lat: 40.7128, lng: -74.0060, address: 'Times Square' },
    destination: { lat: 40.7589, lng: -73.9851, address: 'Central Park' },
    vehicleType: 'sedan'
  });
  
  console.log('\n2. Completing the booking...\n');
  
  // Complete the booking
  await bookingService.completeBooking(booking.id, {
    duration: 25,
    rating: 5
  });
  
  console.log('\n=== Demo Complete ===');
  console.log('Notice how the BookingService doesn\'t know about any of the notification services!');
  console.log('All notifications happened automatically through the Observer pattern.');
}

// Run the demonstration
demonstrateObserverPattern();
```

## 🧪 Testing Observer Pattern

The Observer pattern makes testing much easier because you can test each component independently:

```javascript
describe('Observer Pattern', () => {
  let eventBus;
  let bookingService;
  
  beforeEach(() => {
    eventBus = new EventBus();
    bookingService = new BookingService(eventBus);
  });
  
  describe('EventBus', () => {
    test('should notify all subscribers', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('TestEvent', handler1);
      eventBus.subscribe('TestEvent', handler2);
      
      await eventBus.publish('TestEvent', { test: 'data' });
      
      expect(handler1).toHaveBeenCalledWith({ test: 'data' });
      expect(handler2).toHaveBeenCalledWith({ test: 'data' });
    });
    
    test('should handle handler priorities', async () => {
      const callOrder = [];
      
      eventBus.subscribe('TestEvent', () => callOrder.push('low'), { priority: 1 });
      eventBus.subscribe('TestEvent', () => callOrder.push('high'), { priority: 10 });
      eventBus.subscribe('TestEvent', () => callOrder.push('medium'), { priority: 5 });
      
      await eventBus.publish('TestEvent');
      
      expect(callOrder).toEqual(['high', 'medium', 'low']);
    });
    
    test('should support one-time subscriptions', async () => {
      const handler = jest.fn();
      
      eventBus.once('TestEvent', handler);
      
      await eventBus.publish('TestEvent', 'first');
      await eventBus.publish('TestEvent', 'second');
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('first');
    });
    
    test('should allow unsubscribing', async () => {
      const handler = jest.fn();
      
      const listenerId = eventBus.subscribe('TestEvent', handler);
      eventBus.unsubscribe('TestEvent', listenerId);
      
      await eventBus.publish('TestEvent');
      
      expect(handler).not.toHaveBeenCalled();
    });
  });
  
  describe('BookingService with Observer Pattern', () => {
    test('should publish BookingCreated event', async () => {
      const eventHandler = jest.fn();
      eventBus.subscribe('BookingCreated', eventHandler);
      
      const booking = await bookingService.createBooking({
        userId: 'test_user',
        userEmail: 'test@example.com',
        userPhone: '+1234567890',
        pickup: { lat: 40.7128, lng: -74.0060 },
        destination: { lat: 40.7589, lng: -73.9851 },
        vehicleType: 'sedan'
      });
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          id: booking.id,
          userId: 'test_user',
          status: 'confirmed'
        })
      );
    });
    
    test('should not fail if no observers are subscribed', async () => {
      // No subscribers registered
      
      await expect(bookingService.createBooking({
        userId: 'test_user',
        userEmail: 'test@example.com',
        userPhone: '+1234567890',
        pickup: { lat: 40.7128, lng: -74.0060 },
        destination: { lat: 40.7589, lng: -73.9851 },
        vehicleType: 'sedan'
      })).resolves.toBeDefined();
    });
  });
  
  describe('Event Handlers', () => {
    test('EmailNotificationHandler should send confirmation email', async () => {
      const mockEmailService = {
        send: jest.fn().mockResolvedValue(true)
      };
      
      const emailHandler = new EmailNotificationHandler(mockEmailService);
      
      await emailHandler.handleBookingCreated({
        id: 'booking_123',
        userEmail: 'test@example.com',
        vehicleType: 'sedan'
      });
      
      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Booking Confirmed',
        body: expect.stringContaining('booking_123')
      });
    });
    
    test('AnalyticsHandler should track booking events', async () => {
      const mockAnalyticsService = {
        track: jest.fn().mockResolvedValue(true)
      };
      
      const analyticsHandler = new AnalyticsHandler(mockAnalyticsService);
      
      await analyticsHandler.handleBookingCreated({
        id: 'booking_123',
        userId: 'user_456',
        vehicleType: 'suv',
        amount: 25.50
      });
      
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('booking_created', {
        bookingId: 'booking_123',
        vehicleType: 'suv',
        amount: 25.50,
        userId: 'user_456',
        timestamp: expect.any(Date)
      });
    });
  });
});
```

## ✅ Benefits of Observer Pattern

### 1. **Loose Coupling**
```javascript
// Subject doesn't know about specific observers
class BookingService {
  createBooking(data) {
    const booking = this.saveBooking(data);
    this.eventBus.publish('BookingCreated', booking); // Don't know who's listening
    return booking;
  }
}

// Observers don't know about each other
class EmailHandler {
  handleBookingCreated(booking) {
    // Just sends email, doesn't know about SMS or analytics
  }
}
```

### 2. **Easy to Extend**
```javascript
// Add new notifications without changing existing code
class SlackNotificationHandler {
  handleBookingCreated(booking) {
    this.slackService.sendMessage(`New booking: ${booking.id}`);
  }
}

// Just subscribe it to events - no other code changes needed
eventBus.subscribe('BookingCreated', (booking) => slackHandler.handleBookingCreated(booking));
```

### 3. **Dynamic Subscription**
```javascript
// Can add/remove observers at runtime
if (user.preferences.emailNotifications) {
  eventBus.subscribe('BookingCreated', emailHandler);
}

if (user.preferences.smsNotifications) {
  eventBus.subscribe('BookingCreated', smsHandler);
}
```

### 4. **Independent Failure**
```javascript
// If one observer fails, others still work
eventBus.subscribe('BookingCreated', (booking) => {
  try {
    emailService.send(booking.userEmail, 'Confirmation');
  } catch (error) {
    // Email failed, but SMS and analytics still work
    console.error('Email failed:', error);
  }
});
```

## ⚠️ Common Mistakes

### 1. **Memory Leaks from Not Unsubscribing**
```javascript
// BAD: Never unsubscribe
class Component {
  constructor(eventBus) {
    eventBus.subscribe('SomeEvent', this.handleEvent);
    // Component gets destroyed but listener remains!
  }
}

// GOOD: Always unsubscribe
class Component {
  constructor(eventBus) {
    this.unsubscribe = eventBus.subscribe('SomeEvent', this.handleEvent);
  }
  
  destroy() {
    this.unsubscribe(); // Clean up!
  }
}
```

### 2. **Synchronous Observers Blocking**
```javascript
// BAD: Slow observer blocks others
eventBus.subscribe('BookingCreated', (booking) => {
  // This takes 5 seconds and blocks everything!
  slowEmailService.send(booking.userEmail);
});

// GOOD: Make observers async or non-blocking
eventBus.subscribe('BookingCreated', async (booking) => {
  // Run in background, don't block other observers
  setImmediate(() => {
    slowEmailService.send(booking.userEmail);
  });
});
```

### 3. **Observer Side Effects**
```javascript
// BAD: Observer modifies the data
eventBus.subscribe('BookingCreated', (booking) => {
  booking.processed = true; // BAD! Modifying shared data
});

// GOOD: Observers should be read-only
eventBus.subscribe('BookingCreated', (booking) => {
  const processedBooking = { ...booking, processed: true }; // Create copy
  this.processBooking(processedBooking);
});
```

### 4. **Too Many Events**
```javascript
// BAD: Event for every tiny thing
eventBus.publish('BookingIdGenerated', id);
eventBus.publish('BookingValidated', data);
eventBus.publish('BookingAmountCalculated', amount);
// Too granular!

// GOOD: Meaningful business events
eventBus.publish('BookingCreated', booking);
eventBus.publish('BookingStatusChanged', { booking, newStatus });
eventBus.publish('BookingCompleted', booking);
```

---

# 11. How Patterns Work Together

## 🎯 The Big Picture

Now that you've learned individual design patterns, let's see how they work together in a real system. It's like learning individual musical instruments and then seeing how they create a symphony together.

### 🎼 Pattern Orchestra Analogy
Think of design patterns like instruments in an orchestra:
- **Dependency Injection** = Conductor (coordinates everything)
- **Factory Pattern** = Music stands (creates what each musician needs)
- **Strategy Pattern** = Different musical styles (jazz, classical, rock)
- **Observer Pattern** = Audience (reacts to the music)
- **Command Pattern** = Sheet music (encapsulates what to play)
- **Builder Pattern** = Composer (builds complex compositions)

Each instrument is valuable alone, but together they create something magnificent!

## 🔄 Pattern Collaboration Examples

### Example 1: Creating a Booking (All Patterns Working Together)

Let's see how creating a single booking uses multiple patterns:

```javascript
// This single operation uses 8 design patterns!
async function createBookingExample() {
  // 1. DEPENDENCY INJECTION - Get services from container
  const container = getContainer();
  const bookingService = container.resolve('bookingService');
  
  // 2. BUILDER PATTERN - Build complex booking object
  const bookingData = new BookingBuilder()
    .setUserId('user_123')
    .setPickupLocation(40.7128, -74.0060, 'Times Square')
    .setDestination(40.7589, -73.9851, 'Central Park')
    .setVehicleType('sedan')
    .setPaymentMethod('credit_card')
    .build();
  
  // 3. FACTORY PATTERN - Create pricing strategy based on conditions
  const pricingStrategy = PricingStrategyFactory.createStrategy('surge', {
    surgeMultiplier: 1.5
  });
  
  // 4. STRATEGY PATTERN - Calculate fare using selected strategy
  const fareCalculator = new FareCalculator(pricingStrategy);
  const fareDetails = fareCalculator.calculateFare(bookingData);
  
  // 5. COMMAND PATTERN - Encapsulate the booking creation operation
  const createBookingCommand = new CreateBookingCommand({
    ...bookingData,
    fareDetails
  });
  
  // 6. REPOSITORY PATTERN - Save booking to database
  const bookingRepository = container.resolve('bookingRepository');
  // Repository uses decorators for caching, logging, validation
  
  // 7. ADAPTER PATTERN - Process payment through external service
  const paymentAdapter = PaymentAdapterFactory.create('stripe');
  
  // 8. OBSERVER PATTERN - Notify all interested parties
  const eventBus = container.resolve('eventBus');
  
  try {
    // Execute the command
    const booking = await commandBus.execute(createBookingCommand);
    
    // This automatically triggers:
    // - Email notification (Observer)
    // - SMS notification (Observer)
    // - Analytics tracking (Observer)
    // - Driver assignment (Observer)
    // - Audit logging (Observer)
    
    return booking;
  } catch (error) {
    // Command pattern handles automatic rollback
    console.error('Booking creation failed:', error);
    throw error;
  }
}
```

### Example 2: Pattern Chain Reaction

Here's how one pattern triggers another in a chain reaction:

```javascript
// USER CLICKS "BOOK RIDE" BUTTON
// ↓
// 1. BUILDER creates booking object
const booking = new BookingBuilder()
  .setUserId(userId)
  .setPickup(pickup)
  .setDestination(destination)
  .build();

// ↓
// 2. FACTORY selects appropriate strategy
const strategy = PricingStrategyFactory.createFromConditions(conditions);

// ↓
// 3. STRATEGY calculates the fare
const fare = strategy.calculate(booking.distance);

// ↓
// 4. COMMAND encapsulates the operation
const command = new CreateBookingCommand(booking, fare);

// ↓
// 5. DEPENDENCY INJECTION provides required services
const paymentService = container.resolve('paymentService');

// ↓
// 6. ADAPTER processes payment through external API
const paymentResult = await paymentAdapter.charge(fare.amount);

// ↓
// 7. REPOSITORY saves to database (with decorators)
const savedBooking = await repository.save(booking);

// ↓
// 8. OBSERVER pattern notifies everyone
await eventBus.publish('BookingCreated', savedBooking);

// This triggers:
// - Email service sends confirmation
// - SMS service sends notification
// - Analytics service records metrics
// - Driver matching service finds driver
// - Audit service logs the event
```

## 🏗️ Architectural Layers with Patterns

Let's see how patterns organize into architectural layers:

```javascript
// PRESENTATION LAYER
class BookingController {
  constructor(commandBus) {
    this.commandBus = commandBus; // DEPENDENCY INJECTION
  }
  
  async createBooking(req, res) {
    const command = new CreateBookingCommand(req.body); // COMMAND PATTERN
    const result = await this.commandBus.execute(command);
    res.json(result);
  }
}

// BUSINESS LOGIC LAYER
class BookingService {
  constructor(repository, pricingStrategy, eventBus) {
    this.repository = repository; // DEPENDENCY INJECTION
    this.pricingStrategy = pricingStrategy; // STRATEGY PATTERN
    this.eventBus = eventBus; // OBSERVER PATTERN
  }
  
  async createBooking(bookingData) {
    // BUILDER PATTERN
    const booking = new BookingBuilder()
      .fromData(bookingData)
      .calculateFare(this.pricingStrategy)
      .build();
    
    // REPOSITORY PATTERN
    const savedBooking = await this.repository.save(booking);
    
    // OBSERVER PATTERN
    await this.eventBus.publish('BookingCreated', savedBooking);
    
    return savedBooking;
  }
}

// DATA ACCESS LAYER
class BookingRepository {
  constructor(database, cache) {
    this.database = database; // DEPENDENCY INJECTION
    this.cache = cache;
  }
  
  async save(booking) {
    // Save to database
    const saved = await this.database.save(booking);
    
    // Cache the result
    await this.cache.set(booking.id, saved);
    
    return saved;
  }
}

// EXTERNAL SERVICES LAYER
class PaymentService {
  constructor(paymentAdapter) {
    this.paymentAdapter = paymentAdapter; // ADAPTER PATTERN
  }
  
  async processPayment(amount, method) {
    // ADAPTER handles different payment gateways
    return await this.paymentAdapter.charge(amount, method);
  }
}

// INFRASTRUCTURE LAYER
class DIContainer {
  constructor() {
    this.setupFactories(); // FACTORY PATTERN
    this.setupStrategies(); // STRATEGY PATTERN
    this.setupAdapters(); // ADAPTER PATTERN
  }
  
  setupFactories() {
    this.register('paymentAdapterFactory', PaymentAdapterFactory);
    this.register('pricingStrategyFactory', PricingStrategyFactory);
  }
}
```

## 🔧 Pattern Interaction Benefits

### 1. **Flexibility Through Composition**
```javascript
// Can mix and match patterns
class BookingService {
  constructor(
    repository,      // REPOSITORY + DECORATOR patterns
    pricingStrategy, // STRATEGY pattern
    eventBus,        // OBSERVER pattern
    commandBus       // COMMAND pattern
  ) {
    // Each pattern provides specific flexibility
    // - Repository: Can switch databases
    // - Strategy: Can switch pricing algorithms
    // - Observer: Can add/remove notifications
    // - Command: Can undo operations
  }
}
```

### 2. **Testability Through Isolation**
```javascript
// Each pattern can be tested independently
describe('BookingService', () => {
  test('should use injected pricing strategy', () => {
    const mockStrategy = { calculate: jest.fn().mockReturnValue(100) };
    const mockRepository = { save: jest.fn() };
    const mockEventBus = { publish: jest.fn() };
    
    const service = new BookingService(mockRepository, mockStrategy, mockEventBus);
    
    // Test just the service logic, patterns provide isolation
  });
});
```

### 3. **Scalability Through Separation**
```javascript
// Patterns allow independent scaling
// - Command processing can be scaled with queues
// - Observer notifications can be async/distributed
// - Repository caching can be scaled with Redis clusters
// - Strategies can be configured per region
```

## 🚀 Real-World Pattern Combinations

### Combination 1: Factory + Strategy + Dependency Injection
```javascript
// Problem: Need different pricing for different regions
// Solution: Combine patterns

class RegionalPricingFactory {
  static create(region, container) {
    // FACTORY creates appropriate strategy
    switch (region) {
      case 'US':
        return new USPricingStrategy(
          container.resolve('usTaxCalculator')  // DEPENDENCY INJECTION
        );
      case 'EU':
        return new EUPricingStrategy(
          container.resolve('euVatCalculator')  // DEPENDENCY INJECTION
        );
      default:
        return new StandardPricingStrategy();
    }
  }
}

// Usage
const strategy = RegionalPricingFactory.create(user.region, container);
const fareCalculator = new FareCalculator(strategy); // STRATEGY PATTERN
```

### Combination 2: Command + Observer + Repository
```javascript
// Problem: Complex operations need coordination and notifications
// Solution: Command orchestrates, Observer notifies, Repository persists

class ComplexBookingCommand extends Command {
  async execute() {
    // 1. Save booking (REPOSITORY PATTERN)
    const booking = await this.bookingRepository.save(this.bookingData);
    
    // 2. Process payment
    const payment = await this.paymentService.charge(booking.amount);
    
    // 3. Update booking
    booking.paymentId = payment.id;
    await this.bookingRepository.update(booking);
    
    // 4. Notify everyone (OBSERVER PATTERN)
    await this.eventBus.publish('BookingCompleted', booking);
    
    return booking;
  }
  
  async undo() {
    // COMMAND PATTERN provides rollback
    await this.paymentService.refund(this.payment.id);
    await this.bookingRepository.delete(this.booking.id);
  }
}
```

### Combination 3: Builder + Adapter + Strategy
```javascript
// Problem: Build complex configurations for external services
// Solution: Builder creates config, Adapter handles service, Strategy selects approach

class PaymentConfigurationBuilder {
  constructor() {
    this.reset();
  }
  
  setRegion(region) {
    this.config.region = region;
    return this;
  }
  
  setPaymentMethod(method) {
    this.config.paymentMethod = method;
    return this;
  }
  
  build() {
    // STRATEGY PATTERN selects configuration approach
    const strategy = PaymentConfigurationStrategy.select(this.config);
    
    // BUILDER creates the final configuration
    const finalConfig = strategy.buildConfiguration(this.config);
    
    // ADAPTER PATTERN will use this configuration
    return finalConfig;
  }
}

// Usage
const config = new PaymentConfigurationBuilder()
  .setRegion('US')
  .setPaymentMethod('credit_card')
  .setCurrency('USD')
  .build();

const paymentAdapter = new StripeAdapter(config); // ADAPTER uses built config
```

## 🎯 When to Use Pattern Combinations

### 1. **High Complexity Operations**
Use multiple patterns when:
- Operation has many steps (Command + Observer)
- Multiple algorithms possible (Strategy + Factory)
- Need flexibility and testability (Dependency Injection + Repository)

### 2. **External Integration**
Use patterns when integrating with external services:
- Adapter (for interface compatibility)
- Strategy (for different service options)
- Observer (for status notifications)

### 3. **Scalable Architecture**
Use patterns for scalability:
- Repository (for data access flexibility)
- Observer (for async processing)
- Command (for queue-based processing)

## ⚠️ Avoid Over-Engineering

### Warning Signs:
```javascript
// TOO MANY PATTERNS for simple task
class SimpleGreeting {
  // Don't need all these patterns for "Hello World"!
  constructor(strategyFactory, commandBus, repository, eventBus) {
    this.strategy = strategyFactory.create('greeting');
    this.commandBus = commandBus;
    this.repository = repository;
    this.eventBus = eventBus;
  }
  
  async sayHello(name) {
    const command = new SayHelloCommand(name, this.strategy);
    const result = await this.commandBus.execute(command);
    await this.repository.save(result);
    await this.eventBus.publish('GreetingSaid', result);
    return result;
  }
}

// BETTER: Simple solution for simple problem
function sayHello(name) {
  return `Hello, ${name}!`;
}
```

### Good Rule of Thumb:
- **1-2 patterns:** Usually appropriate
- **3-4 patterns:** Carefully consider if all are needed
- **5+ patterns:** Probably over-engineering

---

# 22. Conclusion & Next Steps

## 🎉 Congratulations!

You've completed a comprehensive journey through design patterns! You now understand:

✅ **What design patterns are and why they matter**  
✅ **How to implement 9 essential design patterns**  
✅ **Real-world examples from a transport booking system**  
✅ **How patterns work together to create robust systems**  
✅ **When to use patterns and when NOT to use them**  
✅ **How to test pattern-based code**  

## 🏆 What You've Accomplished

### 1. **Mastered Core Patterns**
- **Dependency Injection** - Loose coupling and testability
- **Factory Pattern** - Flexible object creation
- **Builder Pattern** - Complex object construction
- **Strategy Pattern** - Interchangeable algorithms
- **Command Pattern** - Encapsulated operations with undo
- **Observer Pattern** - Event-driven architecture
- **Repository Pattern** - Data access abstraction
- **Decorator Pattern** - Dynamic behavior enhancement
- **Adapter Pattern** - External service integration

### 2. **Learned Pattern Synergy**
You understand how patterns work together to create:
- More maintainable code
- Better testability
- Higher flexibility
- Easier scalability

### 3. **Gained Practical Experience**
Through the transport booking system examples, you've seen:
- Real-world problem solving
- Enterprise-level architecture
- Pattern implementation best practices
- Common pitfalls and how to avoid them

## 🚀 Your Next Steps

### Immediate Actions (This Week)
1. **Practice with Small Projects**
   ```javascript
   // Try implementing patterns in simple projects
   // Start with Builder or Strategy pattern
   const todoBuilder = new TodoBuilder()
     .setTitle('Learn Design Patterns')
     .setPriority('high')
     .setDueDate(tomorrow)
     .build();
   ```

2. **Review Existing Code**
   - Look at your current projects
   - Identify where patterns could improve the code
   - Start with the most problematic areas

3. **Experiment with Pattern Combinations**
   ```javascript
   // Try combining 2-3 patterns in a small project
   const service = container.resolve('todoService'); // DI
   const command = new CreateTodoCommand(todoData);  // Command
   await commandBus.execute(command);                // Execution
   ```

### Short Term (This Month)
1. **Build a Complete Mini-Project**
   - Choose a simple domain (e.g., blog, task manager, simple e-commerce)
   - Implement 3-4 design patterns
   - Focus on one pattern at a time

2. **Study More Patterns**
   - Chain of Responsibility
   - Template Method
   - State Pattern
   - Proxy Pattern

3. **Learn Testing Patterns**
   - Mock objects
   - Test fixtures
   - Test builders

### Medium Term (Next 3 Months)
1. **Enterprise Patterns**
   - CQRS (Command Query Responsibility Segregation)
   - Event Sourcing
   - Saga Pattern
   - Circuit Breaker

2. **Architectural Patterns**
   - Microservices patterns
   - API Gateway pattern
   - Database per service
   - Event-driven architecture

3. **Contribute to Open Source**
   - Find projects using design patterns
   - Understand how they're implemented
   - Make small contributions

### Long Term (6-12 Months)
1. **System Design Skills**
   - Learn to design large-scale systems
   - Understand distributed system patterns
   - Study high-availability patterns

2. **Language-Specific Patterns**
   - Learn patterns specific to your favorite languages
   - Study framework patterns (React, Angular, Spring, etc.)

3. **Team Leadership**
   - Teach patterns to others
   - Lead architecture discussions
   - Establish coding standards

## 📚 Recommended Resources

### Books
1. **"Design Patterns: Elements of Reusable Object-Oriented Software"** by Gang of Four
   - The classic book that started it all
   - More academic but comprehensive

2. **"Head First Design Patterns"** by Eric Freeman
   - Beginner-friendly with great examples
   - Visual learning approach

3. **"Clean Code"** by Robert Martin
   - Principles that work well with patterns
   - Focus on maintainable code

### Online Resources
1. **Refactoring.guru** - Excellent pattern explanations with code examples
2. **SourceMaking.com** - Pattern examples in multiple languages
3. **Martin Fowler's Blog** - Enterprise patterns and architectural insights

### Practice Projects
1. **E-commerce System**
   - Cart (Builder pattern)
   - Payment processing (Strategy + Adapter)
   - Order management (Command + Observer)

2. **Game Development**
   - Character creation (Builder + Factory)
   - Game states (State pattern)
   - Actions (Command pattern)

3. **Content Management System**
   - Plugin system (Strategy + Factory)
   - Workflow management (Command + Observer)
   - Data access (Repository + Decorator)

## 🎯 Pattern Selection Guidelines

### When Starting a New Project:
1. **Start Simple** - Don't add patterns until you need them
2. **Identify Pain Points** - Where is your code getting messy?
3. **Add One Pattern at a Time** - Don't overwhelm yourself
4. **Refactor Gradually** - Improve existing code step by step

### Pattern Priority Order:
1. **Dependency Injection** - Almost always beneficial
2. **Repository Pattern** - If you have data access
3. **Strategy Pattern** - If you have multiple algorithms
4. **Factory Pattern** - If you create many objects
5. **Observer Pattern** - If you have notifications/events
6. **Command Pattern** - If you need undo or complex operations
7. **Builder Pattern** - If you have complex object creation
8. **Adapter Pattern** - If you integrate with external services
9. **Decorator Pattern** - If you need dynamic behavior

## 🔮 Future of Design Patterns

### Emerging Trends:
1. **Functional Programming Patterns**
   - Patterns adapted for functional languages
   - Immutable data structures
   - Function composition patterns

2. **Reactive Programming Patterns**
   - Observable streams
   - Reactive repositories
   - Event-driven architectures

3. **Cloud-Native Patterns**
   - Microservices patterns
   - Containerization patterns
   - Serverless patterns

4. **AI/ML Patterns**
   - Model-View-Controller for ML
   - Pipeline patterns for data processing
   - Strategy patterns for algorithm selection

## 💪 Building Your Expertise

### Beginner → Intermediate (3-6 months)
- Can implement individual patterns correctly
- Understands when to use each pattern
- Can explain patterns to others
- Writes testable, maintainable code

### Intermediate → Advanced (6-12 months)
- Combines patterns effectively
- Designs pattern-based architectures
- Can refactor legacy code using patterns
- Understands performance implications

### Advanced → Expert (1-2 years)
- Creates new patterns for specific domains
- Teaches patterns and architecture
- Leads technical architecture decisions
- Contributes to open source pattern libraries

## 🌟 Final Words of Encouragement

Design patterns are tools, not rules. They should make your life easier, not harder. Remember:

- **Start small** and build your understanding gradually
- **Practice regularly** with real projects
- **Don't force patterns** where they don't belong
- **Focus on solving problems**, not using patterns for their own sake
- **Keep learning** - the field is always evolving

The journey from beginner to expert is a marathon, not a sprint. Every expert was once a beginner who kept practicing.

## 🤝 Community and Support

### Join the Community:
1. **Stack Overflow** - Ask questions about specific implementations
2. **Reddit r/programming** - Discuss patterns and architecture
3. **Discord/Slack communities** - Real-time help and discussions
4. **Local meetups** - Connect with other developers

### Share Your Knowledge:
1. **Write blog posts** about your pattern implementations
2. **Create open source examples** on GitHub
3. **Answer questions** from other beginners
4. **Give talks** at local meetups or conferences

---

## 🎊 You're Ready!

You now have the foundation to write better, more maintainable code. Remember:

> "The best time to plant a tree was 20 years ago. The second best time is now."

Start applying these patterns in your next project. Your future self (and your teammates) will thank you!

**Happy coding, and may your software be forever maintainable! 🚀**

---

*This guide was created to bridge the gap between theory and practice. If you found it helpful, consider sharing it with other developers who are starting their design patterns journey.*