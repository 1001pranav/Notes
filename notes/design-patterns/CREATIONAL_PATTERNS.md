# Creational Design Patterns

[← Back to Main Guide](../DESIGN_PATTERNS_BEGINNER_GUIDE.md)

## Table of Contents
1. [Singleton Pattern](#1-singleton-pattern)
2. [Factory Pattern](#2-factory-pattern)
3. [Abstract Factory Pattern](#3-abstract-factory-pattern)
4. [Builder Pattern](#4-builder-pattern)
5. [Prototype Pattern](#5-prototype-pattern)

---

## 1. Singleton Pattern

### 📋 Intent
Ensure a class has only **one instance** and provide a global point of access to it.

### 🔧 When to Use
- Database connections
- Configuration objects
- Logging services
- Cache managers
- Thread pools

### ⚠️ When NOT to Use
- When you need multiple instances
- In unit testing (makes mocking difficult)
- When it creates global state (can lead to tight coupling)

### 💡 Real-World Analogy
A country has only one president at a time. No matter how many times you ask "who's the president?", you get the same person.

### 📝 JavaScript Implementation

```javascript
// Method 1: Using Class (ES6)
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.connection = null;
    this.connected = false;
    Database.instance = this;
  }

  connect(url) {
    if (!this.connected) {
      this.connection = url;
      this.connected = true;
      console.log(`Connected to ${url}`);
    }
    return this.connection;
  }

  disconnect() {
    this.connected = false;
    this.connection = null;
    console.log('Disconnected');
  }
}

// Usage
const db1 = new Database();
db1.connect('mongodb://localhost:27017');

const db2 = new Database();
db2.connect('mysql://localhost:3306'); // Won't reconnect

console.log(db1 === db2); // true - same instance!
```

```javascript
// Method 2: Using IIFE (Immediately Invoked Function Expression)
const ConfigManager = (function() {
  let instance;

  function createInstance() {
    return {
      apiUrl: 'https://api.example.com',
      timeout: 5000,
      retries: 3,

      getConfig() {
        return {
          apiUrl: this.apiUrl,
          timeout: this.timeout,
          retries: this.retries
        };
      },

      setConfig(config) {
        Object.assign(this, config);
      }
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// Usage
const config1 = ConfigManager.getInstance();
const config2 = ConfigManager.getInstance();

config1.setConfig({ timeout: 10000 });
console.log(config2.getConfig()); // timeout: 10000
console.log(config1 === config2); // true
```

```javascript
// Method 3: Using ES6 Module (Modern approach)
// logger.js
class Logger {
  constructor() {
    this.logs = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, message });
    console.log(`[${timestamp}] ${message}`);
  }

  getLogs() {
    return this.logs;
  }
}

export default new Logger(); // Export instance, not class

// app.js
import logger from './logger.js';
logger.log('Application started');

// another-file.js
import logger from './logger.js'; // Same instance
logger.log('Processing data');
console.log(logger.getLogs()); // Shows both logs
```

### ✅ Pros
- Controlled access to single instance
- Reduced memory usage
- Global access point
- Lazy initialization possible

### ❌ Cons
- Difficult to test (global state)
- Violates Single Responsibility Principle
- Can hide dependencies
- Requires careful handling in multi-threaded environments

### 🔗 Related Patterns
- **Factory Method**: Can use Singleton to ensure factory is unique
- **Abstract Factory**: Often implemented as Singleton

---

## 2. Factory Pattern

### 📋 Intent
Create objects without specifying the exact class. Let a function/method decide which class to instantiate.

### 🔧 When to Use
- When you don't know which exact type to create until runtime
- When object creation is complex
- When you want to centralize object creation logic
- When you want to decouple object creation from usage

### ⚠️ When NOT to Use
- For simple object creation (just use `new`)
- When there's only one type of object

### 💡 Real-World Analogy
A car factory can produce different types of cars (sedan, SUV, truck) based on customer order, but the customer doesn't need to know the manufacturing details.

### 📝 JavaScript Implementation

```javascript
// Simple Factory
class Car {
  constructor(type, doors, engine) {
    this.type = type;
    this.doors = doors;
    this.engine = engine;
  }

  displaySpecs() {
    console.log(`${this.type}: ${this.doors} doors, ${this.engine} engine`);
  }
}

class CarFactory {
  static createCar(type) {
    switch(type) {
      case 'sedan':
        return new Car('Sedan', 4, 'V4');
      case 'suv':
        return new Car('SUV', 4, 'V6');
      case 'truck':
        return new Car('Truck', 2, 'V8');
      default:
        throw new Error(`Unknown car type: ${type}`);
    }
  }
}

// Usage
const sedan = CarFactory.createCar('sedan');
const suv = CarFactory.createCar('suv');

sedan.displaySpecs(); // Sedan: 4 doors, V4 engine
suv.displaySpecs();   // SUV: 4 doors, V6 engine
```

```javascript
// Factory with Multiple Product Types
class Button {
  render() {}
}

class WindowsButton extends Button {
  render() {
    return '<button class="windows-btn">Windows Button</button>';
  }
}

class MacButton extends Button {
  render() {
    return '<button class="mac-btn">Mac Button</button>';
  }
}

class Checkbox {
  render() {}
}

class WindowsCheckbox extends Checkbox {
  render() {
    return '<input type="checkbox" class="windows-checkbox">';
  }
}

class MacCheckbox extends Checkbox {
  render() {
    return '<input type="checkbox" class="mac-checkbox">';
  }
}

class UIFactory {
  static createButton(os) {
    switch(os) {
      case 'windows':
        return new WindowsButton();
      case 'mac':
        return new MacButton();
      default:
        throw new Error(`Unknown OS: ${os}`);
    }
  }

  static createCheckbox(os) {
    switch(os) {
      case 'windows':
        return new WindowsCheckbox();
      case 'mac':
        return new MacCheckbox();
      default:
        throw new Error(`Unknown OS: ${os}`);
    }
  }
}

// Usage
const userOS = 'mac';
const button = UIFactory.createButton(userOS);
const checkbox = UIFactory.createCheckbox(userOS);

console.log(button.render());   // Mac styled button
console.log(checkbox.render()); // Mac styled checkbox
```

```javascript
// Factory with Registration (Dynamic)
class ShapeFactory {
  constructor() {
    this.shapes = {};
  }

  register(name, shapeClass) {
    this.shapes[name] = shapeClass;
  }

  create(name, ...args) {
    const ShapeClass = this.shapes[name];
    if (!ShapeClass) {
      throw new Error(`Shape ${name} not registered`);
    }
    return new ShapeClass(...args);
  }
}

class Circle {
  constructor(radius) {
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

// Usage
const factory = new ShapeFactory();
factory.register('circle', Circle);
factory.register('rectangle', Rectangle);

const circle = factory.create('circle', 5);
const rect = factory.create('rectangle', 10, 20);

console.log(circle.area());    // 78.54
console.log(rect.area());      // 200
```

### ✅ Pros
- Decouples object creation from usage
- Easy to add new types
- Centralizes creation logic
- Follows Open/Closed Principle

### ❌ Cons
- Can become complex with many product types
- Adds extra abstraction layer

### 🔗 Related Patterns
- **Abstract Factory**: Creates families of related objects
- **Prototype**: Alternative way to create objects
- **Singleton**: Factory can be implemented as Singleton

---

## 3. Abstract Factory Pattern

### 📋 Intent
Create families of related objects without specifying their concrete classes.

### 🔧 When to Use
- When your system needs to work with multiple families of related products
- When you want to ensure products from the same family are used together
- When you need to switch between different product families

### ⚠️ When NOT to Use
- When you only have one product family
- Simple applications where Factory Pattern is sufficient

### 💡 Real-World Analogy
A furniture factory creates complete sets (chair, sofa, table). You can order a "Modern" set or a "Victorian" set, and all pieces will match the same style.

### 📝 JavaScript Implementation

```javascript
// Abstract Products
class Button {
  click() {}
}

class Checkbox {
  check() {}
}

// Concrete Products - Dark Theme
class DarkButton extends Button {
  click() {
    return 'Dark button clicked';
  }

  render() {
    return `<button style="background: #333; color: #fff">Dark Button</button>`;
  }
}

class DarkCheckbox extends Checkbox {
  check() {
    return 'Dark checkbox checked';
  }

  render() {
    return `<input type="checkbox" class="dark-theme">`;
  }
}

// Concrete Products - Light Theme
class LightButton extends Button {
  click() {
    return 'Light button clicked';
  }

  render() {
    return `<button style="background: #fff; color: #000">Light Button</button>`;
  }
}

class LightCheckbox extends Checkbox {
  check() {
    return 'Light checkbox checked';
  }

  render() {
    return `<input type="checkbox" class="light-theme">`;
  }
}

// Abstract Factory
class UIFactory {
  createButton() {}
  createCheckbox() {}
}

// Concrete Factory - Dark Theme
class DarkThemeFactory extends UIFactory {
  createButton() {
    return new DarkButton();
  }

  createCheckbox() {
    return new DarkCheckbox();
  }
}

// Concrete Factory - Light Theme
class LightThemeFactory extends UIFactory {
  createButton() {
    return new LightButton();
  }

  createCheckbox() {
    return new LightCheckbox();
  }
}

// Client Code
class Application {
  constructor(factory) {
    this.button = factory.createButton();
    this.checkbox = factory.createCheckbox();
  }

  render() {
    return {
      button: this.button.render(),
      checkbox: this.checkbox.render()
    };
  }
}

// Usage
const userPreference = 'dark'; // from user settings

let factory;
if (userPreference === 'dark') {
  factory = new DarkThemeFactory();
} else {
  factory = new LightThemeFactory();
}

const app = new Application(factory);
console.log(app.render());
// All UI elements will be consistently themed
```

```javascript
// Real-world example: Database Connection Factory
class Database {
  connect() {}
  query() {}
}

class Cache {
  get() {}
  set() {}
}

// MySQL Family
class MySQLDatabase extends Database {
  connect() {
    return 'Connected to MySQL';
  }

  query(sql) {
    return `MySQL Query: ${sql}`;
  }
}

class RedisCache extends Cache {
  get(key) {
    return `Redis GET: ${key}`;
  }

  set(key, value) {
    return `Redis SET: ${key} = ${value}`;
  }
}

// MongoDB Family
class MongoDatabase extends Database {
  connect() {
    return 'Connected to MongoDB';
  }

  query(query) {
    return `MongoDB Query: ${JSON.stringify(query)}`;
  }
}

class MongoCache extends Cache {
  get(key) {
    return `MongoDB Cache GET: ${key}`;
  }

  set(key, value) {
    return `MongoDB Cache SET: ${key} = ${value}`;
  }
}

// Abstract Factory
class DataStackFactory {
  createDatabase() {}
  createCache() {}
}

// MySQL Stack
class MySQLStackFactory extends DataStackFactory {
  createDatabase() {
    return new MySQLDatabase();
  }

  createCache() {
    return new RedisCache();
  }
}

// MongoDB Stack
class MongoStackFactory extends DataStackFactory {
  createDatabase() {
    return new MongoDatabase();
  }

  createCache() {
    return new MongoCache();
  }
}

// Client
class DataService {
  constructor(factory) {
    this.db = factory.createDatabase();
    this.cache = factory.createCache();
  }

  saveData(key, data) {
    this.cache.set(key, data);
    return this.db.query(`INSERT INTO table VALUES ('${data}')`);
  }
}

// Usage
const stack = process.env.DB_TYPE === 'mongo'
  ? new MongoStackFactory()
  : new MySQLStackFactory();

const service = new DataService(stack);
console.log(service.saveData('user:1', 'John Doe'));
```

### ✅ Pros
- Ensures product compatibility within families
- Isolates concrete classes
- Easy to switch between product families
- Promotes consistency

### ❌ Cons
- Complex code structure
- Difficult to add new products to family
- More classes to maintain

### 🔗 Related Patterns
- **Factory Method**: Abstract Factory uses Factory Methods
- **Singleton**: Factories often implemented as Singletons
- **Prototype**: Can use instead of Factory Method

---

## 4. Builder Pattern

### 📋 Intent
Construct complex objects step by step. Allows you to produce different types and representations using the same construction process.

### 🔧 When to Use
- When object has many optional parameters
- When construction process must allow different representations
- When you want to create immutable objects with many fields
- To avoid "telescoping constructor" problem

### ⚠️ When NOT to Use
- For simple objects with few parameters
- When object creation is straightforward

### 💡 Real-World Analogy
Building a house: you build it step by step (foundation, walls, roof, interior), and you can create different house styles using the same building process.

### 📝 JavaScript Implementation

```javascript
// Product
class Car {
  constructor() {
    this.make = '';
    this.model = '';
    this.year = 0;
    this.color = '';
    this.engine = '';
    this.transmission = '';
    this.features = [];
  }

  displaySpecs() {
    return `
      ${this.year} ${this.make} ${this.model}
      Color: ${this.color}
      Engine: ${this.engine}
      Transmission: ${this.transmission}
      Features: ${this.features.join(', ')}
    `;
  }
}

// Builder
class CarBuilder {
  constructor() {
    this.car = new Car();
  }

  setMake(make) {
    this.car.make = make;
    return this; // Return this for method chaining
  }

  setModel(model) {
    this.car.model = model;
    return this;
  }

  setYear(year) {
    this.car.year = year;
    return this;
  }

  setColor(color) {
    this.car.color = color;
    return this;
  }

  setEngine(engine) {
    this.car.engine = engine;
    return this;
  }

  setTransmission(transmission) {
    this.car.transmission = transmission;
    return this;
  }

  addFeature(feature) {
    this.car.features.push(feature);
    return this;
  }

  build() {
    return this.car;
  }
}

// Usage
const car = new CarBuilder()
  .setMake('Tesla')
  .setModel('Model S')
  .setYear(2024)
  .setColor('Red')
  .setEngine('Electric')
  .setTransmission('Automatic')
  .addFeature('Autopilot')
  .addFeature('Premium Sound System')
  .addFeature('Heated Seats')
  .build();

console.log(car.displaySpecs());
```

```javascript
// Real-world: HTTP Request Builder
class HttpRequest {
  constructor() {
    this.method = 'GET';
    this.url = '';
    this.headers = {};
    this.body = null;
    this.timeout = 30000;
    this.retries = 0;
  }
}

class RequestBuilder {
  constructor(url) {
    this.request = new HttpRequest();
    this.request.url = url;
  }

  get() {
    this.request.method = 'GET';
    return this;
  }

  post() {
    this.request.method = 'POST';
    return this;
  }

  put() {
    this.request.method = 'PUT';
    return this;
  }

  delete() {
    this.request.method = 'DELETE';
    return this;
  }

  setHeader(key, value) {
    this.request.headers[key] = value;
    return this;
  }

  setHeaders(headers) {
    this.request.headers = { ...this.request.headers, ...headers };
    return this;
  }

  setBody(body) {
    this.request.body = body;
    return this;
  }

  setTimeout(ms) {
    this.request.timeout = ms;
    return this;
  }

  setRetries(count) {
    this.request.retries = count;
    return this;
  }

  async send() {
    const options = {
      method: this.request.method,
      headers: this.request.headers,
      body: this.request.body ? JSON.stringify(this.request.body) : null
    };

    return fetch(this.request.url, options);
  }

  build() {
    return this.request;
  }
}

// Usage
const response = await new RequestBuilder('https://api.example.com/users')
  .post()
  .setHeader('Content-Type', 'application/json')
  .setHeader('Authorization', 'Bearer token123')
  .setBody({ name: 'John', email: 'john@example.com' })
  .setTimeout(5000)
  .setRetries(3)
  .send();
```

```javascript
// Builder with Director
class Pizza {
  constructor() {
    this.size = '';
    this.crust = '';
    this.sauce = '';
    this.toppings = [];
  }

  describe() {
    return `${this.size} pizza with ${this.crust} crust, ${this.sauce} sauce, and ${this.toppings.join(', ')}`;
  }
}

class PizzaBuilder {
  constructor() {
    this.pizza = new Pizza();
  }

  setSize(size) {
    this.pizza.size = size;
    return this;
  }

  setCrust(crust) {
    this.pizza.crust = crust;
    return this;
  }

  setSauce(sauce) {
    this.pizza.sauce = sauce;
    return this;
  }

  addTopping(topping) {
    this.pizza.toppings.push(topping);
    return this;
  }

  build() {
    return this.pizza;
  }
}

// Director - knows how to build specific types
class PizzaDirector {
  constructor(builder) {
    this.builder = builder;
  }

  makeMargherita() {
    return this.builder
      .setSize('Medium')
      .setCrust('Thin')
      .setSauce('Tomato')
      .addTopping('Mozzarella')
      .addTopping('Basil')
      .build();
  }

  makePepperoni() {
    return this.builder
      .setSize('Large')
      .setCrust('Regular')
      .setSauce('Tomato')
      .addTopping('Mozzarella')
      .addTopping('Pepperoni')
      .build();
  }

  makeVeggie() {
    return this.builder
      .setSize('Medium')
      .setCrust('Whole Wheat')
      .setSauce('Tomato')
      .addTopping('Mozzarella')
      .addTopping('Mushrooms')
      .addTopping('Bell Peppers')
      .addTopping('Olives')
      .build();
  }
}

// Usage
const director = new PizzaDirector(new PizzaBuilder());
const margherita = director.makeMargherita();
const pepperoni = director.makePepperoni();

console.log(margherita.describe());
console.log(pepperoni.describe());

// Or build custom pizza
const custom = new PizzaBuilder()
  .setSize('Large')
  .setCrust('Stuffed')
  .setSauce('BBQ')
  .addTopping('Chicken')
  .addTopping('Onions')
  .build();
```

### ✅ Pros
- Construct objects step-by-step
- Reuse construction code for different representations
- Method chaining provides fluent interface
- Isolates complex construction code

### ❌ Cons
- More code (multiple classes)
- Increases overall complexity

### 🔗 Related Patterns
- **Abstract Factory**: Can be used together
- **Composite**: Builder often builds Composites
- **Singleton**: Builder can be Singleton

---

## 5. Prototype Pattern

### 📋 Intent
Create new objects by copying an existing object (prototype) rather than creating from scratch.

### 🔧 When to Use
- When object creation is expensive
- When you need objects similar to existing ones
- When you want to avoid subclassing
- When classes to instantiate are specified at runtime

### ⚠️ When NOT to Use
- When copying is more expensive than creation
- When objects don't have many shared properties

### 💡 Real-World Analogy
Photocopying a document is faster than rewriting it from scratch. You make a copy and modify only what's different.

### 📝 JavaScript Implementation

```javascript
// Basic Prototype Pattern
class Prototype {
  clone() {
    return Object.create(this);
  }
}

class Car extends Prototype {
  constructor(make, model, year) {
    super();
    this.make = make;
    this.model = model;
    this.year = year;
    this.features = [];
  }

  addFeature(feature) {
    this.features.push(feature);
  }

  clone() {
    // Shallow clone
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    // Deep clone arrays
    cloned.features = [...this.features];
    return cloned;
  }
}

// Usage
const originalCar = new Car('Tesla', 'Model S', 2024);
originalCar.addFeature('Autopilot');
originalCar.addFeature('Premium Sound');

const clonedCar = originalCar.clone();
clonedCar.year = 2025;
clonedCar.addFeature('New Battery');

console.log(originalCar.features); // ['Autopilot', 'Premium Sound']
console.log(clonedCar.features);   // ['Autopilot', 'Premium Sound', 'New Battery']
```

```javascript
// Prototype with Registry (Prototype Manager)
class Shape {
  constructor(type) {
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.color = '';
  }

  clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    return cloned;
  }
}

class Circle extends Shape {
  constructor() {
    super('circle');
    this.radius = 0;
  }

  draw() {
    return `Circle at (${this.x},${this.y}), radius: ${this.radius}, color: ${this.color}`;
  }
}

class Rectangle extends Shape {
  constructor() {
    super('rectangle');
    this.width = 0;
    this.height = 0;
  }

  draw() {
    return `Rectangle at (${this.x},${this.y}), ${this.width}x${this.height}, color: ${this.color}`;
  }
}

// Prototype Registry
class ShapeRegistry {
  constructor() {
    this.shapes = {};
  }

  register(name, shape) {
    this.shapes[name] = shape;
  }

  create(name) {
    const prototype = this.shapes[name];
    if (!prototype) {
      throw new Error(`Shape ${name} not found in registry`);
    }
    return prototype.clone();
  }
}

// Usage
const registry = new ShapeRegistry();

// Register prototypes
const defaultCircle = new Circle();
defaultCircle.radius = 10;
defaultCircle.color = 'red';
registry.register('default-circle', defaultCircle);

const defaultRect = new Rectangle();
defaultRect.width = 20;
defaultRect.height = 30;
defaultRect.color = 'blue';
registry.register('default-rectangle', defaultRect);

// Clone from registry and customize
const circle1 = registry.create('default-circle');
circle1.x = 100;
circle1.y = 100;

const circle2 = registry.create('default-circle');
circle2.x = 200;
circle2.y = 200;
circle2.radius = 15; // Different size

console.log(circle1.draw());
console.log(circle2.draw());
```

```javascript
// Deep Clone with Complex Objects
class Character {
  constructor(name) {
    this.name = name;
    this.level = 1;
    this.stats = {
      health: 100,
      mana: 50,
      strength: 10
    };
    this.inventory = [];
    this.skills = new Map();
  }

  deepClone() {
    const cloned = new Character(this.name);
    cloned.level = this.level;

    // Deep clone object
    cloned.stats = { ...this.stats };

    // Deep clone array
    cloned.inventory = this.inventory.map(item => ({ ...item }));

    // Deep clone Map
    cloned.skills = new Map(this.skills);

    return cloned;
  }
}

// Usage
const warrior = new Character('Warrior');
warrior.level = 10;
warrior.stats.strength = 50;
warrior.inventory.push({ name: 'Sword', damage: 20 });
warrior.skills.set('slash', { damage: 30, cooldown: 2 });

const warriorClone = warrior.deepClone();
warriorClone.name = 'Warrior Clone';
warriorClone.inventory.push({ name: 'Shield', defense: 15 });

console.log(warrior.inventory.length);      // 1
console.log(warriorClone.inventory.length); // 2
```

```javascript
// Using Object.create() for Prototypal Inheritance
const carPrototype = {
  init(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
    return this;
  },

  displayInfo() {
    return `${this.year} ${this.make} ${this.model}`;
  },

  clone() {
    return Object.create(this);
  }
};

// Usage
const car1 = Object.create(carPrototype).init('Honda', 'Civic', 2024);
const car2 = car1.clone();
car2.year = 2025;

console.log(car1.displayInfo()); // 2024 Honda Civic
console.log(car2.displayInfo()); // 2025 Honda Civic
```

### ✅ Pros
- Reduces initialization cost for expensive objects
- Simplifies object creation
- Can add/remove objects at runtime
- Reduces subclassing

### ❌ Cons
- Cloning complex objects can be tricky
- Deep cloning requires careful implementation
- Circular references need special handling

### 🔗 Related Patterns
- **Abstract Factory**: Can store prototypes
- **Composite**: Often clones prototypes
- **Decorator**: Can be used with Prototype

---

## Summary

### Quick Comparison

| Pattern | Purpose | Example Use Case |
|---------|---------|-----------------|
| **Singleton** | One instance only | Database connection |
| **Factory** | Create objects without specifying type | UI component creation |
| **Abstract Factory** | Create families of objects | Themed UI components |
| **Builder** | Build complex objects step-by-step | HTTP request builder |
| **Prototype** | Clone existing objects | Game character templates |

### Next Steps
Now that you understand Creational Patterns, move on to:

📖 **[Structural Patterns →](./STRUCTURAL_PATTERNS.md)**

Or return to:
📖 **[← Main Guide](../DESIGN_PATTERNS_BEGINNER_GUIDE.md)**
