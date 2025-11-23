# Structural Design Patterns

[← Back to Main Guide](../DESIGN_PATTERNS_BEGINNER_GUIDE.md)

## Table of Contents
1. [Adapter Pattern](#1-adapter-pattern)
2. [Decorator Pattern](#2-decorator-pattern)
3. [Facade Pattern](#3-facade-pattern)
4. [Proxy Pattern](#4-proxy-pattern)
5. [Composite Pattern](#5-composite-pattern)
6. [Bridge Pattern](#6-bridge-pattern)
7. [Flyweight Pattern](#7-flyweight-pattern)

---

## 1. Adapter Pattern

### 📋 Intent
Convert the interface of a class into another interface clients expect. Allows incompatible interfaces to work together.

### 🔧 When to Use
- When you want to use an existing class but its interface doesn't match what you need
- When integrating with third-party libraries
- When you want to create reusable classes that work with unrelated classes
- Legacy system integration

### ⚠️ When NOT to Use
- When you can modify the original class
- When the adaptation is too complex

### 💡 Real-World Analogy
A power adapter allows you to plug a US device into a European outlet. It converts one interface to another without changing the device or outlet.

### 📝 JavaScript Implementation

```javascript
// Old interface (Adaptee)
class OldCalculator {
  operation(num1, num2, operation) {
    switch(operation) {
      case 'add':
        return num1 + num2;
      case 'subtract':
        return num1 - num2;
      default:
        return NaN;
    }
  }
}

// New interface (Target)
class NewCalculator {
  add(num1, num2) {
    return num1 + num2;
  }

  subtract(num1, num2) {
    return num1 - num2;
  }
}

// Adapter
class CalculatorAdapter {
  constructor() {
    this.calculator = new OldCalculator();
  }

  add(num1, num2) {
    return this.calculator.operation(num1, num2, 'add');
  }

  subtract(num1, num2) {
    return this.calculator.operation(num1, num2, 'subtract');
  }
}

// Usage
const calculator = new CalculatorAdapter();
console.log(calculator.add(5, 3));      // 8
console.log(calculator.subtract(10, 4)); // 6
```

```javascript
// Real-world: API Adapter
class ThirdPartyAPI {
  fetchUserData(userId) {
    // Returns data in different format
    return {
      id: userId,
      full_name: 'John Doe',
      email_address: 'john@example.com',
      phone_number: '123-456-7890'
    };
  }
}

class UserAPIAdapter {
  constructor() {
    this.api = new ThirdPartyAPI();
  }

  getUser(userId) {
    const data = this.api.fetchUserData(userId);

    // Adapt to our expected format
    return {
      id: data.id,
      name: data.full_name,
      email: data.email_address,
      phone: data.phone_number
    };
  }
}

// Usage
const userAPI = new UserAPIAdapter();
const user = userAPI.getUser(123);
console.log(user); // { id: 123, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' }
```

```javascript
// Multiple Adaptees
class GoogleMapsAPI {
  getLocation(address) {
    return { lat: 40.7128, lng: -74.0060, formatted: 'New York, NY' };
  }
}

class MapboxAPI {
  findPlace(query) {
    return { latitude: 40.7128, longitude: -74.0060, name: 'New York, NY' };
  }
}

// Unified interface
class LocationServiceAdapter {
  constructor(service) {
    this.service = service;
  }

  getCoordinates(location) {
    if (this.service instanceof GoogleMapsAPI) {
      const result = this.service.getLocation(location);
      return { lat: result.lat, lon: result.lng };
    } else if (this.service instanceof MapboxAPI) {
      const result = this.service.findPlace(location);
      return { lat: result.latitude, lon: result.longitude };
    }
  }
}

// Usage
const googleAdapter = new LocationServiceAdapter(new GoogleMapsAPI());
const mapboxAdapter = new LocationServiceAdapter(new MapboxAPI());

console.log(googleAdapter.getCoordinates('New York'));
console.log(mapboxAdapter.getCoordinates('New York'));
```

### ✅ Pros
- Follows Single Responsibility Principle
- Follows Open/Closed Principle
- Existing code doesn't need modification
- Promotes code reusability

### ❌ Cons
- Increases complexity
- Additional layer of abstraction

### 🔗 Related Patterns
- **Bridge**: Similar but designed upfront
- **Decorator**: Adds functionality rather than adapting interface
- **Facade**: Simplifies interface, Adapter makes interface compatible

---

## 2. Decorator Pattern

### 📋 Intent
Attach additional responsibilities to an object dynamically. Provides flexible alternative to subclassing for extending functionality.

### 🔧 When to Use
- When you want to add responsibilities to objects without affecting other objects
- When extension by subclassing is impractical
- When you need to add/remove responsibilities at runtime
- When you have many possible combinations of features

### ⚠️ When NOT to Use
- When you only need to add one feature
- When inheritance is more straightforward

### 💡 Real-World Analogy
Adding toppings to a pizza. The base pizza remains the same, but you can add cheese, pepperoni, mushrooms, etc., and each topping adds to the cost and description.

### 📝 JavaScript Implementation

```javascript
// Component
class Coffee {
  cost() {
    return 5;
  }

  description() {
    return 'Simple coffee';
  }
}

// Decorators
class MilkDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost() + 1;
  }

  description() {
    return this.coffee.description() + ', milk';
  }
}

class SugarDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost() + 0.5;
  }

  description() {
    return this.coffee.description() + ', sugar';
  }
}

class WhipDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost() + 1.5;
  }

  description() {
    return this.coffee.description() + ', whipped cream';
  }
}

// Usage
let myCoffee = new Coffee();
console.log(myCoffee.description(), '-', myCoffee.cost()); // Simple coffee - 5

myCoffee = new MilkDecorator(myCoffee);
console.log(myCoffee.description(), '-', myCoffee.cost()); // Simple coffee, milk - 6

myCoffee = new SugarDecorator(myCoffee);
console.log(myCoffee.description(), '-', myCoffee.cost()); // Simple coffee, milk, sugar - 6.5

myCoffee = new WhipDecorator(myCoffee);
console.log(myCoffee.description(), '-', myCoffee.cost()); // Simple coffee, milk, sugar, whipped cream - 8
```

```javascript
// Real-world: Notification System
class Notification {
  send(message) {
    console.log(`Sending: ${message}`);
  }
}

class EmailDecorator {
  constructor(notification) {
    this.notification = notification;
  }

  send(message) {
    this.notification.send(message);
    this.sendEmail(message);
  }

  sendEmail(message) {
    console.log(`📧 Email sent: ${message}`);
  }
}

class SMSDecorator {
  constructor(notification) {
    this.notification = notification;
  }

  send(message) {
    this.notification.send(message);
    this.sendSMS(message);
  }

  sendSMS(message) {
    console.log(`📱 SMS sent: ${message}`);
  }
}

class SlackDecorator {
  constructor(notification) {
    this.notification = notification;
  }

  send(message) {
    this.notification.send(message);
    this.sendSlack(message);
  }

  sendSlack(message) {
    console.log(`💬 Slack message sent: ${message}`);
  }
}

// Usage
let notification = new Notification();
notification = new EmailDecorator(notification);
notification = new SMSDecorator(notification);
notification = new SlackDecorator(notification);

notification.send('Server is down!');
// Output:
// Sending: Server is down!
// 📧 Email sent: Server is down!
// 📱 SMS sent: Server is down!
// 💬 Slack message sent: Server is down!
```

```javascript
// Using ES6 Classes with Base Interface
class DataSource {
  writeData(data) {
    console.log(`Writing data: ${data}`);
  }

  readData() {
    return 'Data';
  }
}

class DataSourceDecorator extends DataSource {
  constructor(source) {
    super();
    this.wrappee = source;
  }

  writeData(data) {
    this.wrappee.writeData(data);
  }

  readData() {
    return this.wrappee.readData();
  }
}

class EncryptionDecorator extends DataSourceDecorator {
  writeData(data) {
    const encrypted = this.encrypt(data);
    super.writeData(encrypted);
  }

  readData() {
    const data = super.readData();
    return this.decrypt(data);
  }

  encrypt(data) {
    return `encrypted(${data})`;
  }

  decrypt(data) {
    return data.replace('encrypted(', '').replace(')', '');
  }
}

class CompressionDecorator extends DataSourceDecorator {
  writeData(data) {
    const compressed = this.compress(data);
    super.writeData(compressed);
  }

  readData() {
    const data = super.readData();
    return this.decompress(data);
  }

  compress(data) {
    return `compressed(${data})`;
  }

  decompress(data) {
    return data.replace('compressed(', '').replace(')', '');
  }
}

// Usage
let source = new DataSource();
source = new EncryptionDecorator(source);
source = new CompressionDecorator(source);

source.writeData('Important data');
// Output: Writing data: compressed(encrypted(Important data))
```

### ✅ Pros
- More flexible than static inheritance
- Add/remove responsibilities at runtime
- Combine behaviors in different ways
- Follows Single Responsibility Principle
- Follows Open/Closed Principle

### ❌ Cons
- Many small objects
- Can be hard to debug
- Order of decorators matters

### 🔗 Related Patterns
- **Composite**: Decorator adds responsibilities, Composite aggregates
- **Strategy**: Changes object internals, Decorator changes exterior
- **Adapter**: Changes interface, Decorator enhances without changing interface

---

## 3. Facade Pattern

### 📋 Intent
Provide a simplified interface to a complex subsystem. Makes subsystems easier to use.

### 🔧 When to Use
- When you want to provide a simple interface to a complex system
- When there are many interdependent classes
- When you want to layer your subsystem
- To reduce coupling between clients and subsystems

### ⚠️ When NOT to Use
- When the subsystem is already simple
- When you need direct access to all features

### 💡 Real-World Analogy
A restaurant menu is a facade for the complex kitchen operations. You order "Chicken Parmesan" without knowing all the cooking steps involved.

### 📝 JavaScript Implementation

```javascript
// Complex subsystem
class CPU {
  freeze() {
    console.log('CPU: Freezing...');
  }

  jump(position) {
    console.log(`CPU: Jumping to ${position}`);
  }

  execute() {
    console.log('CPU: Executing...');
  }
}

class Memory {
  load(position, data) {
    console.log(`Memory: Loading ${data} at position ${position}`);
  }
}

class HardDrive {
  read(sector, size) {
    console.log(`HardDrive: Reading sector ${sector}, size ${size}`);
    return 'boot data';
  }
}

// Facade
class ComputerFacade {
  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }

  start() {
    console.log('Starting computer...');
    this.cpu.freeze();
    const bootData = this.hardDrive.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
    console.log('Computer started!\n');
  }
}

// Usage
const computer = new ComputerFacade();
computer.start();
// Much simpler than managing CPU, Memory, and HardDrive separately!
```

```javascript
// Real-world: Payment Processing Facade
class PayPalAPI {
  authenticate(email, password) {
    console.log('PayPal: Authenticating...');
    return 'paypal_token';
  }

  makePayment(token, amount) {
    console.log(`PayPal: Processing $${amount}`);
    return { success: true, transactionId: 'PP123' };
  }
}

class StripeAPI {
  setAPIKey(key) {
    console.log('Stripe: Setting API key...');
  }

  charge(amount, currency, source) {
    console.log(`Stripe: Charging ${currency} ${amount}`);
    return { success: true, chargeId: 'ST456' };
  }
}

class BankTransferAPI {
  connect(accountNumber, routingNumber) {
    console.log('Bank: Connecting...');
  }

  transfer(amount) {
    console.log(`Bank: Transferring $${amount}`);
    return { success: true, referenceNumber: 'BT789' };
  }
}

// Facade
class PaymentFacade {
  processPayment(method, amount, credentials) {
    console.log(`\nProcessing ${method} payment for $${amount}...`);

    switch(method) {
      case 'paypal': {
        const paypal = new PayPalAPI();
        const token = paypal.authenticate(credentials.email, credentials.password);
        const result = paypal.makePayment(token, amount);
        return result;
      }

      case 'stripe': {
        const stripe = new StripeAPI();
        stripe.setAPIKey(credentials.apiKey);
        const result = stripe.charge(amount, 'USD', credentials.source);
        return result;
      }

      case 'bank': {
        const bank = new BankTransferAPI();
        bank.connect(credentials.account, credentials.routing);
        const result = bank.transfer(amount);
        return result;
      }

      default:
        throw new Error('Unsupported payment method');
    }
  }
}

// Usage
const payment = new PaymentFacade();

payment.processPayment('paypal', 100, {
  email: 'user@example.com',
  password: 'secret'
});

payment.processPayment('stripe', 200, {
  apiKey: 'sk_test_123',
  source: 'tok_visa'
});
```

```javascript
// Real-world: Video Conversion Facade
class VideoFile {
  constructor(filename) {
    this.filename = filename;
  }
}

class OggCompressionCodec {
  compress(file) {
    console.log('Compressing with OGG codec');
    return 'compressed_ogg_data';
  }
}

class MPEG4CompressionCodec {
  compress(file) {
    console.log('Compressing with MPEG4 codec');
    return 'compressed_mp4_data';
  }
}

class CodecFactory {
  static extract(file) {
    if (file.filename.endsWith('.ogg')) {
      return new OggCompressionCodec();
    } else if (file.filename.endsWith('.mp4')) {
      return new MPEG4CompressionCodec();
    }
  }
}

class BitrateReader {
  static read(file, codec) {
    console.log('Reading bitrate...');
    return 'bitrate_data';
  }

  static convert(buffer, codec) {
    console.log('Converting bitrate...');
    return 'converted_data';
  }
}

class AudioMixer {
  static fix(result) {
    console.log('Fixing audio...');
    return 'fixed_audio_data';
  }
}

// Facade
class VideoConverter {
  convert(filename, format) {
    console.log(`\nConverting ${filename} to ${format}...`);

    const file = new VideoFile(filename);
    const sourceCodec = CodecFactory.extract(file);

    let destinationCodec;
    if (format === 'mp4') {
      destinationCodec = new MPEG4CompressionCodec();
    } else {
      destinationCodec = new OggCompressionCodec();
    }

    const buffer = BitrateReader.read(file, sourceCodec);
    const result = BitrateReader.convert(buffer, destinationCodec);
    const finalResult = AudioMixer.fix(result);

    console.log('Conversion complete!\n');
    return new VideoFile(`converted.${format}`);
  }
}

// Usage
const converter = new VideoConverter();
converter.convert('funny_video.ogg', 'mp4');
// Client doesn't need to know about codecs, bitrates, audio mixing!
```

### ✅ Pros
- Isolates clients from subsystem components
- Reduces coupling
- Simplifies interface
- Easier to use and understand

### ❌ Cons
- Can become a god object
- May not expose all features
- Additional layer of abstraction

### 🔗 Related Patterns
- **Abstract Factory**: Can be used with Facade to create subsystem objects
- **Mediator**: Similar but focuses on communication between objects
- **Singleton**: Facade is often implemented as Singleton

---

## 4. Proxy Pattern

### 📋 Intent
Provide a surrogate or placeholder for another object to control access to it.

### 🔧 When to Use
- **Virtual Proxy**: Delay expensive object creation until needed
- **Protection Proxy**: Control access based on permissions
- **Remote Proxy**: Represent object in different address space
- **Caching Proxy**: Cache results of expensive operations
- **Logging Proxy**: Log requests to the real object

### ⚠️ When NOT to Use
- When direct access is simpler and sufficient
- When the overhead of proxy is too much

### 💡 Real-World Analogy
A credit card is a proxy for a bank account. You can use it to access your money without carrying cash, and it provides security and logging.

### 📝 JavaScript Implementation

```javascript
// Real Subject
class RealImage {
  constructor(filename) {
    this.filename = filename;
    this.loadFromDisk();
  }

  loadFromDisk() {
    console.log(`Loading image: ${this.filename}`);
    // Simulate expensive operation
    console.log('Loading... (expensive operation)');
  }

  display() {
    console.log(`Displaying: ${this.filename}`);
  }
}

// Virtual Proxy - Lazy Loading
class ImageProxy {
  constructor(filename) {
    this.filename = filename;
    this.realImage = null;
  }

  display() {
    // Load only when needed
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// Usage
console.log('Creating proxy...');
const image = new ImageProxy('large_photo.jpg');

console.log('\nProxy created, image not loaded yet');
console.log('Calling display()...');
image.display(); // Loads now

console.log('\nCalling display() again...');
image.display(); // Uses cached image
```

```javascript
// Protection Proxy - Access Control
class BankAccount {
  constructor(balance = 0) {
    this.balance = balance;
  }

  deposit(amount) {
    this.balance += amount;
    return this.balance;
  }

  withdraw(amount) {
    if (amount <= this.balance) {
      this.balance -= amount;
      return this.balance;
    }
    throw new Error('Insufficient funds');
  }

  getBalance() {
    return this.balance;
  }
}

class BankAccountProxy {
  constructor(account, user) {
    this.account = account;
    this.user = user;
  }

  deposit(amount) {
    if (this.user.role === 'owner' || this.user.role === 'admin') {
      console.log(`${this.user.name} depositing $${amount}`);
      return this.account.deposit(amount);
    }
    throw new Error('Permission denied: Cannot deposit');
  }

  withdraw(amount) {
    if (this.user.role === 'owner') {
      console.log(`${this.user.name} withdrawing $${amount}`);
      return this.account.withdraw(amount);
    }
    throw new Error('Permission denied: Cannot withdraw');
  }

  getBalance() {
    if (this.user.role === 'owner' || this.user.role === 'admin' || this.user.role === 'viewer') {
      return this.account.getBalance();
    }
    throw new Error('Permission denied: Cannot view balance');
  }
}

// Usage
const account = new BankAccount(1000);

const owner = { name: 'John', role: 'owner' };
const viewer = { name: 'Jane', role: 'viewer' };

const ownerProxy = new BankAccountProxy(account, owner);
const viewerProxy = new BankAccountProxy(account, viewer);

ownerProxy.deposit(500);    // ✅ Allowed
console.log(ownerProxy.getBalance()); // ✅ Allowed

console.log(viewerProxy.getBalance()); // ✅ Allowed
// viewerProxy.withdraw(100); // ❌ Error: Permission denied
```

```javascript
// Caching Proxy
class APIService {
  fetchUserData(userId) {
    console.log(`Fetching data for user ${userId} from API...`);
    // Simulate API call
    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    };
  }
}

class CachedAPIProxy {
  constructor() {
    this.api = new APIService();
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute
  }

  fetchUserData(userId) {
    const now = Date.now();
    const cached = this.cache.get(userId);

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      console.log(`Returning cached data for user ${userId}`);
      return cached.data;
    }

    const data = this.api.fetchUserData(userId);
    this.cache.set(userId, { data, timestamp: now });
    return data;
  }

  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }
}

// Usage
const api = new CachedAPIProxy();

api.fetchUserData(1); // Fetches from API
api.fetchUserData(1); // Returns from cache
api.fetchUserData(2); // Fetches from API
api.fetchUserData(1); // Returns from cache
```

```javascript
// Logging Proxy
class Calculator {
  add(a, b) {
    return a + b;
  }

  subtract(a, b) {
    return a - b;
  }
}

class LoggingCalculatorProxy {
  constructor() {
    this.calculator = new Calculator();
  }

  add(a, b) {
    console.log(`[LOG] add(${a}, ${b})`);
    const result = this.calculator.add(a, b);
    console.log(`[LOG] Result: ${result}`);
    return result;
  }

  subtract(a, b) {
    console.log(`[LOG] subtract(${a}, ${b})`);
    const result = this.calculator.subtract(a, b);
    console.log(`[LOG] Result: ${result}`);
    return result;
  }
}

// Usage
const calc = new LoggingCalculatorProxy();
calc.add(5, 3);
calc.subtract(10, 4);
```

```javascript
// Using ES6 Proxy (Built-in JavaScript Proxy)
const targetObject = {
  name: 'John',
  age: 30
};

const handler = {
  get(target, property) {
    console.log(`Getting property: ${property}`);
    return target[property];
  },

  set(target, property, value) {
    console.log(`Setting ${property} = ${value}`);
    if (property === 'age' && typeof value !== 'number') {
      throw new Error('Age must be a number');
    }
    target[property] = value;
    return true;
  }
};

const proxy = new Proxy(targetObject, handler);

// Usage
console.log(proxy.name);    // Getting property: name
proxy.age = 31;             // Setting age = 31
// proxy.age = 'thirty';    // Error: Age must be a number
```

### ✅ Pros
- Controls access to object
- Can add functionality (logging, caching) without changing object
- Lazy initialization
- Security and protection

### ❌ Cons
- Additional complexity
- Slower response (additional layer)
- Code duplication possible

### 🔗 Related Patterns
- **Adapter**: Changes interface, Proxy keeps same interface
- **Decorator**: Adds responsibilities, Proxy controls access
- **Facade**: Simplifies interface, Proxy provides same interface

---

## 5. Composite Pattern

### 📋 Intent
Compose objects into tree structures to represent part-whole hierarchies. Allows clients to treat individual objects and compositions uniformly.

### 🔧 When to Use
- When you need to represent part-whole hierarchies
- When you want clients to treat individual and composite objects uniformly
- File systems, UI components, organizational structures

### ⚠️ When NOT to Use
- When objects don't form a tree structure
- When individual and composite objects need very different interfaces

### 💡 Real-World Analogy
A military organization has soldiers and units. A unit can contain soldiers or other units. You can give orders to a single soldier or an entire unit the same way.

### 📝 JavaScript Implementation

```javascript
// Component
class FileSystemComponent {
  constructor(name) {
    this.name = name;
  }

  getSize() {
    throw new Error('Must implement getSize()');
  }

  print(indent = '') {
    throw new Error('Must implement print()');
  }
}

// Leaf
class File extends FileSystemComponent {
  constructor(name, size) {
    super(name);
    this.size = size;
  }

  getSize() {
    return this.size;
  }

  print(indent = '') {
    console.log(`${indent}📄 ${this.name} (${this.size}KB)`);
  }
}

// Composite
class Directory extends FileSystemComponent {
  constructor(name) {
    super(name);
    this.children = [];
  }

  add(component) {
    this.children.push(component);
  }

  remove(component) {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  getSize() {
    return this.children.reduce((total, child) => {
      return total + child.getSize();
    }, 0);
  }

  print(indent = '') {
    console.log(`${indent}📁 ${this.name}`);
    this.children.forEach(child => {
      child.print(indent + '  ');
    });
  }
}

// Usage
const root = new Directory('root');

const home = new Directory('home');
const user = new Directory('user');
user.add(new File('photo.jpg', 2048));
user.add(new File('document.pdf', 512));

const documents = new Directory('documents');
documents.add(new File('report.docx', 1024));
documents.add(new File('presentation.pptx', 4096));

user.add(documents);
home.add(user);
root.add(home);
root.add(new File('readme.txt', 8));

root.print();
console.log(`\nTotal size: ${root.getSize()}KB`);
```

```javascript
// Real-world: UI Components
class UIComponent {
  constructor(name) {
    this.name = name;
  }

  render() {
    throw new Error('Must implement render()');
  }
}

// Leaf components
class Button extends UIComponent {
  constructor(name, text) {
    super(name);
    this.text = text;
  }

  render(indent = '') {
    console.log(`${indent}<button>${this.text}</button>`);
  }
}

class Input extends UIComponent {
  constructor(name, placeholder) {
    super(name);
    this.placeholder = placeholder;
  }

  render(indent = '') {
    console.log(`${indent}<input placeholder="${this.placeholder}" />`);
  }
}

class Label extends UIComponent {
  constructor(name, text) {
    super(name);
    this.text = text;
  }

  render(indent = '') {
    console.log(`${indent}<label>${this.text}</label>`);
  }
}

// Composite components
class Form extends UIComponent {
  constructor(name) {
    super(name);
    this.children = [];
  }

  add(component) {
    this.children.push(component);
    return this; // For chaining
  }

  remove(component) {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  render(indent = '') {
    console.log(`${indent}<form name="${this.name}">`);
    this.children.forEach(child => child.render(indent + '  '));
    console.log(`${indent}</form>`);
  }
}

class Panel extends UIComponent {
  constructor(name) {
    super(name);
    this.children = [];
  }

  add(component) {
    this.children.push(component);
    return this;
  }

  render(indent = '') {
    console.log(`${indent}<div class="panel" id="${this.name}">`);
    this.children.forEach(child => child.render(indent + '  '));
    console.log(`${indent}</div>`);
  }
}

// Usage
const loginForm = new Form('login-form');
loginForm
  .add(new Label('username-label', 'Username:'))
  .add(new Input('username-input', 'Enter username'))
  .add(new Label('password-label', 'Password:'))
  .add(new Input('password-input', 'Enter password'))
  .add(new Button('submit-btn', 'Login'));

const mainPanel = new Panel('main-panel');
mainPanel.add(loginForm);

mainPanel.render();
```

```javascript
// Company Organization Structure
class Employee {
  constructor(name, position, salary) {
    this.name = name;
    this.position = position;
    this.salary = salary;
  }

  print(indent = '') {
    console.log(`${indent}├─ ${this.name} (${this.position}) - $${this.salary}`);
  }

  getSalary() {
    return this.salary;
  }
}

class Department {
  constructor(name) {
    this.name = name;
    this.employees = [];
  }

  add(employee) {
    this.employees.push(employee);
  }

  remove(employee) {
    const index = this.employees.indexOf(employee);
    if (index !== -1) {
      this.employees.splice(index, 1);
    }
  }

  print(indent = '') {
    console.log(`${indent}📊 ${this.name}`);
    this.employees.forEach(emp => {
      emp.print(indent + '  ');
    });
  }

  getSalary() {
    return this.employees.reduce((total, emp) => {
      return total + emp.getSalary();
    }, 0);
  }
}

// Usage
const company = new Department('Company');

const engineering = new Department('Engineering');
engineering.add(new Employee('Alice', 'Senior Developer', 100000));
engineering.add(new Employee('Bob', 'Developer', 80000));

const devOps = new Department('DevOps');
devOps.add(new Employee('Charlie', 'DevOps Engineer', 90000));

engineering.add(devOps); // Nested department

const sales = new Department('Sales');
sales.add(new Employee('David', 'Sales Manager', 85000));
sales.add(new Employee('Eve', 'Sales Rep', 60000));

company.add(engineering);
company.add(sales);

company.print();
console.log(`\nTotal company salary budget: $${company.getSalary()}`);
```

### ✅ Pros
- Simplified client code
- Easy to add new components
- Flexible structure
- Open/Closed Principle

### ❌ Cons
- Can make design overly general
- Hard to restrict component types

### 🔗 Related Patterns
- **Decorator**: Similar structure but different intent
- **Iterator**: Often used with Composite
- **Visitor**: Can apply operations on Composite structure

---

## 6. Bridge Pattern

### 📋 Intent
Decouple an abstraction from its implementation so they can vary independently.

### 🔧 When to Use
- When you want to avoid permanent binding between abstraction and implementation
- When both abstraction and implementation should be extensible
- When changes in implementation shouldn't affect clients
- When you want to share implementation among multiple objects

### ⚠️ When NOT to Use
- When you only have one implementation
- When abstraction and implementation don't need to vary

### 💡 Real-World Analogy
A universal remote control (abstraction) works with different devices (implementations). The remote has basic functions (power, volume), but each device implements them differently.

### 📝 JavaScript Implementation

```javascript
// Implementation
class Device {
  isEnabled() {}
  enable() {}
  disable() {}
  getVolume() {}
  setVolume(percent) {}
}

// Concrete Implementations
class TV extends Device {
  constructor() {
    super();
    this.on = false;
    this.volume = 50;
  }

  isEnabled() {
    return this.on;
  }

  enable() {
    this.on = true;
    console.log('TV is now ON');
  }

  disable() {
    this.on = false;
    console.log('TV is now OFF');
  }

  getVolume() {
    return this.volume;
  }

  setVolume(percent) {
    this.volume = percent;
    console.log(`TV volume: ${percent}%`);
  }
}

class Radio extends Device {
  constructor() {
    super();
    this.on = false;
    this.volume = 30;
  }

  isEnabled() {
    return this.on;
  }

  enable() {
    this.on = true;
    console.log('Radio is now ON');
  }

  disable() {
    this.on = false;
    console.log('Radio is now OFF');
  }

  getVolume() {
    return this.volume;
  }

  setVolume(percent) {
    this.volume = percent;
    console.log(`Radio volume: ${percent}%`);
  }
}

// Abstraction
class RemoteControl {
  constructor(device) {
    this.device = device;
  }

  togglePower() {
    if (this.device.isEnabled()) {
      this.device.disable();
    } else {
      this.device.enable();
    }
  }

  volumeUp() {
    const current = this.device.getVolume();
    this.device.setVolume(Math.min(100, current + 10));
  }

  volumeDown() {
    const current = this.device.getVolume();
    this.device.setVolume(Math.max(0, current - 10));
  }
}

// Extended Abstraction
class AdvancedRemoteControl extends RemoteControl {
  mute() {
    this.device.setVolume(0);
  }

  setChannel(channel) {
    console.log(`Setting channel to ${channel}`);
  }
}

// Usage
const tv = new TV();
const radio = new Radio();

const tvRemote = new RemoteControl(tv);
tvRemote.togglePower();  // TV is now ON
tvRemote.volumeUp();     // TV volume: 60%

const radioRemote = new AdvancedRemoteControl(radio);
radioRemote.togglePower(); // Radio is now ON
radioRemote.mute();        // Radio volume: 0%
```

```javascript
// Real-world: Notification System
// Implementation: Message Senders
class MessageSender {
  send(message, recipient) {}
}

class EmailSender extends MessageSender {
  send(message, recipient) {
    console.log(`📧 Sending email to ${recipient}: ${message}`);
  }
}

class SMSSender extends MessageSender {
  send(message, recipient) {
    console.log(`📱 Sending SMS to ${recipient}: ${message}`);
  }
}

class PushNotificationSender extends MessageSender {
  send(message, recipient) {
    console.log(`🔔 Sending push notification to ${recipient}: ${message}`);
  }
}

// Abstraction: Notification Types
class Notification {
  constructor(sender) {
    this.sender = sender;
  }

  send(message, recipient) {
    this.sender.send(message, recipient);
  }
}

class UrgentNotification extends Notification {
  send(message, recipient) {
    const urgentMessage = `🚨 URGENT: ${message}`;
    this.sender.send(urgentMessage, recipient);
  }
}

class ReminderNotification extends Notification {
  send(message, recipient) {
    const reminderMessage = `⏰ Reminder: ${message}`;
    this.sender.send(reminderMessage, recipient);
  }
}

// Usage
const emailSender = new EmailSender();
const smsSender = new SMSSender();

const emailNotification = new UrgentNotification(emailSender);
emailNotification.send('Server is down!', 'admin@example.com');

const smsReminder = new ReminderNotification(smsSender);
smsReminder.send('Meeting at 3 PM', '+1234567890');

const pushNotification = new UrgentNotification(new PushNotificationSender());
pushNotification.send('New message from John', 'user123');
```

### ✅ Pros
- Decouples abstraction from implementation
- Both can vary independently
- Reduces class explosion
- Follows Open/Closed Principle
- Follows Single Responsibility Principle

### ❌ Cons
- Increased complexity
- More classes to manage

### 🔗 Related Patterns
- **Adapter**: Makes existing interfaces work together; Bridge designs new interface upfront
- **Abstract Factory**: Can create and configure specific Bridge
- **State**: Can be considered a specialized Bridge

---

## 7. Flyweight Pattern

### 📋 Intent
Use sharing to support large numbers of fine-grained objects efficiently. Minimizes memory usage by sharing data among similar objects.

### 🔧 When to Use
- When app needs to create a huge number of similar objects
- When this causes high memory consumption
- When most object state can be made extrinsic (shared)
- Game development, text editors, graphics systems

### ⚠️ When NOT to Use
- When objects don't share much state
- When memory isn't a concern
- When sharing introduces too much complexity

### 💡 Real-World Analogy
In a text editor, instead of storing font data with each character, characters share references to common font objects. Millions of characters can share a few font objects.

### 📝 JavaScript Implementation

```javascript
// Flyweight
class TreeType {
  constructor(name, color, texture) {
    this.name = name;
    this.color = color;
    this.texture = texture;
  }

  draw(x, y) {
    console.log(`Drawing ${this.color} ${this.name} tree at (${x}, ${y})`);
  }
}

// Flyweight Factory
class TreeFactory {
  constructor() {
    this.treeTypes = {};
  }

  getTreeType(name, color, texture) {
    const key = `${name}_${color}_${texture}`;

    if (!this.treeTypes[key]) {
      this.treeTypes[key] = new TreeType(name, color, texture);
      console.log(`Creating new tree type: ${key}`);
    } else {
      console.log(`Reusing existing tree type: ${key}`);
    }

    return this.treeTypes[key];
  }

  getTreeTypeCount() {
    return Object.keys(this.treeTypes).length;
  }
}

// Context - contains extrinsic state
class Tree {
  constructor(x, y, treeType) {
    this.x = x;
    this.y = y;
    this.treeType = treeType; // Shared flyweight
  }

  draw() {
    this.treeType.draw(this.x, this.y);
  }
}

// Forest - manages trees
class Forest {
  constructor() {
    this.trees = [];
    this.factory = new TreeFactory();
  }

  plantTree(x, y, name, color, texture) {
    const type = this.factory.getTreeType(name, color, texture);
    const tree = new Tree(x, y, type);
    this.trees.push(tree);
  }

  draw() {
    this.trees.forEach(tree => tree.draw());
  }

  getStats() {
    console.log(`\nForest stats:`);
    console.log(`Total trees: ${this.trees.length}`);
    console.log(`Tree types: ${this.factory.getTreeTypeCount()}`);
    console.log(`Memory saved by sharing flyweights!`);
  }
}

// Usage
const forest = new Forest();

// Plant 1000 trees but only create a few tree types
forest.plantTree(1, 2, 'Oak', 'Green', 'Oak_texture');
forest.plantTree(3, 4, 'Oak', 'Green', 'Oak_texture');  // Reuses type
forest.plantTree(5, 6, 'Pine', 'Dark Green', 'Pine_texture');
forest.plantTree(7, 8, 'Oak', 'Green', 'Oak_texture');  // Reuses type
forest.plantTree(9, 10, 'Pine', 'Dark Green', 'Pine_texture'); // Reuses type

forest.draw();
forest.getStats();
```

```javascript
// Real-world: Particle System
class ParticleType {
  constructor(color, sprite, gravity) {
    this.color = color;
    this.sprite = sprite;
    this.gravity = gravity;
  }

  render(x, y, velocity) {
    console.log(`Rendering ${this.color} particle at (${x}, ${y}) with velocity ${velocity}`);
  }
}

class ParticleFactory {
  constructor() {
    this.types = new Map();
  }

  getParticleType(color, sprite, gravity) {
    const key = `${color}_${sprite}_${gravity}`;

    if (!this.types.has(key)) {
      this.types.set(key, new ParticleType(color, sprite, gravity));
      console.log(`Created new particle type: ${key}`);
    }

    return this.types.get(key);
  }
}

class Particle {
  constructor(x, y, velocity, type) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.type = type; // Shared
  }

  update(deltaTime) {
    this.y += this.velocity * deltaTime;
    this.velocity += this.type.gravity * deltaTime;
  }

  render() {
    this.type.render(this.x, this.y, this.velocity);
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.factory = new ParticleFactory();
  }

  createParticle(x, y, velocity, color, sprite, gravity) {
    const type = this.factory.getParticleType(color, sprite, gravity);
    const particle = new Particle(x, y, velocity, type);
    this.particles.push(particle);
  }

  update(deltaTime) {
    this.particles.forEach(p => p.update(deltaTime));
  }

  render() {
    this.particles.forEach(p => p.render());
  }
}

// Usage
const particleSystem = new ParticleSystem();

// Create 1000 particles but only a few types
for (let i = 0; i < 1000; i++) {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const velocity = Math.random() * 10;

  // Most particles share the same types
  if (i % 3 === 0) {
    particleSystem.createParticle(x, y, velocity, 'red', 'fire', 9.8);
  } else if (i % 3 === 1) {
    particleSystem.createParticle(x, y, velocity, 'blue', 'water', 5);
  } else {
    particleSystem.createParticle(x, y, velocity, 'white', 'smoke', -2);
  }
}

particleSystem.update(0.016); // 60 FPS
console.log(`\nTotal particles: ${particleSystem.particles.length}`);
console.log(`Unique types: ${particleSystem.factory.types.size}`);
```

```javascript
// Text Editor Example
class CharacterStyle {
  constructor(font, size, color) {
    this.font = font;
    this.size = size;
    this.color = color;
  }

  render(character) {
    return `<span style="font-family: ${this.font}; font-size: ${this.size}px; color: ${this.color}">${character}</span>`;
  }
}

class StyleFactory {
  constructor() {
    this.styles = new Map();
  }

  getStyle(font, size, color) {
    const key = `${font}_${size}_${color}`;

    if (!this.styles.has(key)) {
      this.styles.set(key, new CharacterStyle(font, size, color));
    }

    return this.styles.get(key);
  }
}

class Character {
  constructor(char, style) {
    this.char = char;
    this.style = style;
  }

  render() {
    return this.style.render(this.char);
  }
}

class TextEditor {
  constructor() {
    this.characters = [];
    this.styleFactory = new StyleFactory();
  }

  insertText(text, font, size, color) {
    const style = this.styleFactory.getStyle(font, size, color);

    for (const char of text) {
      this.characters.push(new Character(char, style));
    }
  }

  render() {
    return this.characters.map(c => c.render()).join('');
  }
}

// Usage
const editor = new TextEditor();
editor.insertText('Hello ', 'Arial', 14, 'black');
editor.insertText('World!', 'Arial', 14, 'red');

console.log(editor.render());
console.log(`Total characters: ${editor.characters.length}`);
console.log(`Unique styles: ${editor.styleFactory.styles.size}`);
```

### ✅ Pros
- Reduces memory consumption
- Can handle large numbers of objects
- Centralizes state management

### ❌ Cons
- More complex code
- CPU cycles traded for memory (creating/finding flyweights)
- Can be overkill for small applications

### 🔗 Related Patterns
- **Composite**: Often combined with Flyweight for shared leaf nodes
- **State/Strategy**: Can be implemented as Flyweights
- **Singleton**: Flyweight factory often implemented as Singleton

---

## Summary

### Quick Comparison

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Adapter** | Make incompatible interfaces work | API integration |
| **Decorator** | Add features dynamically | Notification channels |
| **Facade** | Simplify complex system | Payment processing |
| **Proxy** | Control access | Lazy loading, caching |
| **Composite** | Tree structures | File system, UI |
| **Bridge** | Separate abstraction/implementation | Device remotes |
| **Flyweight** | Share data to save memory | Game particles |

### Next Steps

📖 **[Behavioral Patterns →](./BEHAVIORAL_PATTERNS.md)**

📖 **[← Creational Patterns](./CREATIONAL_PATTERNS.md)**

📖 **[← Main Guide](../DESIGN_PATTERNS_BEGINNER_GUIDE.md)**
