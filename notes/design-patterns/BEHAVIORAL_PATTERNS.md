# Behavioral Design Patterns

[← Back to Main Guide](../DESIGN_PATTERNS_BEGINNER_GUIDE.md)

## Table of Contents
1. [Observer Pattern](#1-observer-pattern)
2. [Strategy Pattern](#2-strategy-pattern)
3. [Command Pattern](#3-command-pattern)
4. [Iterator Pattern](#4-iterator-pattern)
5. [State Pattern](#5-state-pattern)
6. [Template Method Pattern](#6-template-method-pattern)
7. [Chain of Responsibility Pattern](#7-chain-of-responsibility-pattern)
8. [Mediator Pattern](#8-mediator-pattern)
9. [Memento Pattern](#9-memento-pattern)
10. [Visitor Pattern](#10-visitor-pattern)

---

## 1. Observer Pattern

### 📋 Intent
Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

### 🔧 When to Use
- Event handling systems
- Model-View relationship (MVC)
- Real-time data updates
- Subscription systems
- When changes to one object require changing others

### ⚠️ When NOT to Use
- When subscribers need to be executed in specific order
- When notification causes performance issues
- When the relationship is one-to-one

### 💡 Real-World Analogy
YouTube channel subscriptions. When a creator uploads a video, all subscribers get notified automatically.

### 📝 JavaScript Implementation

```javascript
// Subject
class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
    console.log(`Observer subscribed. Total: ${this.observers.length}`);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
    console.log(`Observer unsubscribed. Total: ${this.observers.length}`);
  }

  notify(data) {
    console.log(`Notifying ${this.observers.length} observers...`);
    this.observers.forEach(observer => observer.update(data));
  }
}

// Observers
class Observer {
  constructor(name) {
    this.name = name;
  }

  update(data) {
    console.log(`${this.name} received update:`, data);
  }
}

// Usage
const newsChannel = new Subject();

const viewer1 = new Observer('Alice');
const viewer2 = new Observer('Bob');
const viewer3 = new Observer('Charlie');

newsChannel.subscribe(viewer1);
newsChannel.subscribe(viewer2);
newsChannel.subscribe(viewer3);

newsChannel.notify({ headline: 'Breaking News!', content: 'Major event occurred' });

newsChannel.unsubscribe(viewer2);

newsChannel.notify({ headline: 'Update', content: 'Follow-up story' });
```

```javascript
// Real-world: Stock Market
class Stock {
  constructor(symbol, price) {
    this.symbol = symbol;
    this.price = price;
    this.investors = [];
  }

  attach(investor) {
    this.investors.push(investor);
  }

  detach(investor) {
    this.investors = this.investors.filter(inv => inv !== investor);
  }

  setPrice(price) {
    console.log(`\n${this.symbol} price changed: $${this.price} → $${price}`);
    this.price = price;
    this.notifyInvestors();
  }

  notifyInvestors() {
    this.investors.forEach(investor => {
      investor.update(this);
    });
  }
}

class Investor {
  constructor(name) {
    this.name = name;
  }

  update(stock) {
    console.log(`${this.name} notified: ${stock.symbol} is now $${stock.price}`);
  }
}

// Usage
const apple = new Stock('AAPL', 150);

const investor1 = new Investor('Warren');
const investor2 = new Investor('Elon');

apple.attach(investor1);
apple.attach(investor2);

apple.setPrice(155);
apple.setPrice(160);
```

```javascript
// Event Emitter Pattern (Node.js style)
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event, listenerToRemove) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter(
      listener => listener !== listenerToRemove
    );
  }

  emit(event, ...args) {
    if (!this.events[event]) return;

    this.events[event].forEach(listener => {
      listener(...args);
    });
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
}

// Usage
const emitter = new EventEmitter();

const handleUserLogin = (username) => {
  console.log(`User logged in: ${username}`);
};

const handleUserLogout = (username) => {
  console.log(`User logged out: ${username}`);
};

emitter.on('login', handleUserLogin);
emitter.on('logout', handleUserLogout);
emitter.once('login', () => console.log('First login event!'));

emitter.emit('login', 'john_doe');
emitter.emit('login', 'jane_doe'); // 'First login event!' won't fire again
emitter.emit('logout', 'john_doe');
```

### ✅ Pros
- Loose coupling between subject and observers
- Dynamic relationships
- Supports broadcast communication
- Follows Open/Closed Principle

### ❌ Cons
- Subscribers notified in random order
- Memory leaks if observers aren't unsubscribed
- Can cause performance issues with many observers

### 🔗 Related Patterns
- **Mediator**: Similar but centralizes communication
- **Singleton**: Subject can be Singleton
- **Command**: Can use Observer to notify command execution

---

## 2. Strategy Pattern

### 📋 Intent
Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

### 🔧 When to Use
- When you have multiple algorithms for a specific task
- When you want to switch algorithms at runtime
- When you want to avoid conditional statements
- Payment methods, sorting algorithms, validation rules

### ⚠️ When NOT to Use
- When you only have one algorithm
- When algorithms rarely change

### 💡 Real-World Analogy
Navigation app offering different routes: fastest, shortest, scenic. You choose the strategy based on your preference.

### 📝 JavaScript Implementation

```javascript
// Strategy interface
class PaymentStrategy {
  pay(amount) {
    throw new Error('pay() must be implemented');
  }
}

// Concrete Strategies
class CreditCardStrategy extends PaymentStrategy {
  constructor(cardNumber, cvv) {
    super();
    this.cardNumber = cardNumber;
    this.cvv = cvv;
  }

  pay(amount) {
    console.log(`Paid $${amount} using Credit Card ending in ${this.cardNumber.slice(-4)}`);
  }
}

class PayPalStrategy extends PaymentStrategy {
  constructor(email) {
    super();
    this.email = email;
  }

  pay(amount) {
    console.log(`Paid $${amount} using PayPal account: ${this.email}`);
  }
}

class CryptoStrategy extends PaymentStrategy {
  constructor(walletAddress) {
    super();
    this.walletAddress = walletAddress;
  }

  pay(amount) {
    console.log(`Paid $${amount} using Crypto wallet: ${this.walletAddress}`);
  }
}

// Context
class ShoppingCart {
  constructor() {
    this.items = [];
    this.paymentStrategy = null;
  }

  addItem(item, price) {
    this.items.push({ item, price });
  }

  setPaymentStrategy(strategy) {
    this.paymentStrategy = strategy;
  }

  checkout() {
    const total = this.items.reduce((sum, item) => sum + item.price, 0);
    console.log(`\nTotal: $${total}`);

    if (!this.paymentStrategy) {
      console.log('Please select a payment method');
      return;
    }

    this.paymentStrategy.pay(total);
  }
}

// Usage
const cart = new ShoppingCart();
cart.addItem('Laptop', 1200);
cart.addItem('Mouse', 25);

cart.setPaymentStrategy(new CreditCardStrategy('1234567890123456', '123'));
cart.checkout();

cart.setPaymentStrategy(new PayPalStrategy('user@example.com'));
cart.checkout();

cart.setPaymentStrategy(new CryptoStrategy('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'));
cart.checkout();
```

```javascript
// Real-world: Compression Strategies
class CompressionStrategy {
  compress(files) {}
}

class ZipCompression extends CompressionStrategy {
  compress(files) {
    console.log(`Compressing ${files.length} files using ZIP`);
    return `${files.join(',')}.zip`;
  }
}

class RarCompression extends CompressionStrategy {
  compress(files) {
    console.log(`Compressing ${files.length} files using RAR`);
    return `${files.join(',')}.rar`;
  }
}

class TarCompression extends CompressionStrategy {
  compress(files) {
    console.log(`Compressing ${files.length} files using TAR`);
    return `${files.join(',')}.tar.gz`;
  }
}

class Compressor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  compress(files) {
    return this.strategy.compress(files);
  }
}

// Usage
const files = ['file1.txt', 'file2.txt', 'file3.txt'];

const compressor = new Compressor(new ZipCompression());
compressor.compress(files);

compressor.setStrategy(new RarCompression());
compressor.compress(files);
```

```javascript
// Functional approach (without classes)
const sortStrategies = {
  bubbleSort: (arr) => {
    console.log('Using Bubble Sort');
    // Implementation...
    return arr.sort((a, b) => a - b);
  },

  quickSort: (arr) => {
    console.log('Using Quick Sort');
    // Implementation...
    return arr.sort((a, b) => a - b);
  },

  mergeSort: (arr) => {
    console.log('Using Merge Sort');
    // Implementation...
    return arr.sort((a, b) => a - b);
  }
};

class Sorter {
  constructor(strategy) {
    this.strategy = strategy;
  }

  sort(array) {
    return this.strategy(array);
  }
}

// Usage
const data = [5, 2, 8, 1, 9];

const sorter = new Sorter(sortStrategies.bubbleSort);
console.log(sorter.sort([...data]));

sorter.strategy = sortStrategies.quickSort;
console.log(sorter.sort([...data]));
```

### ✅ Pros
- Easily swap algorithms at runtime
- Isolates algorithm implementation
- Eliminates conditional statements
- Follows Open/Closed Principle
- Follows Single Responsibility Principle

### ❌ Cons
- Increased number of objects
- Client must be aware of different strategies
- Modern languages have simpler alternatives (function parameters)

### 🔗 Related Patterns
- **State**: Similar structure, different intent
- **Template Method**: Defines algorithm skeleton, Strategy replaces whole algorithm
- **Command**: Can use strategies for different commands

---

## 3. Command Pattern

### 📋 Intent
Encapsulate a request as an object, thereby letting you parameterize clients with different requests, queue requests, and support undoable operations.

### 🔧 When to Use
- When you want to parameterize objects with operations
- When you need to queue operations
- When you need undo/redo functionality
- When you need to log operations
- GUI buttons, macro recording, transaction systems

### ⚠️ When NOT to Use
- For simple callbacks
- When undo/redo isn't needed

### 💡 Real-World Analogy
Restaurant orders. The waiter writes your order (command) on a ticket, which is queued in the kitchen. The cook executes commands in order. Orders can be cancelled (undo).

### 📝 JavaScript Implementation

```javascript
// Receiver
class Light {
  turnOn() {
    console.log('💡 Light is ON');
  }

  turnOff() {
    console.log('💡 Light is OFF');
  }
}

// Command Interface
class Command {
  execute() {}
  undo() {}
}

// Concrete Commands
class TurnOnCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }

  execute() {
    this.light.turnOn();
  }

  undo() {
    this.light.turnOff();
  }
}

class TurnOffCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }

  execute() {
    this.light.turnOff();
  }

  undo() {
    this.light.turnOn();
  }
}

// Invoker
class RemoteControl {
  constructor() {
    this.history = [];
  }

  execute(command) {
    command.execute();
    this.history.push(command);
  }

  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
    } else {
      console.log('Nothing to undo');
    }
  }
}

// Usage
const light = new Light();
const remote = new RemoteControl();

const turnOn = new TurnOnCommand(light);
const turnOff = new TurnOffCommand(light);

remote.execute(turnOn);   // Light is ON
remote.execute(turnOff);  // Light is OFF
remote.undo();            // Light is ON (undo last command)
remote.undo();            // Light is OFF (undo previous command)
```

```javascript
// Real-world: Text Editor with Undo/Redo
class TextEditor {
  constructor() {
    this.content = '';
  }

  getContent() {
    return this.content;
  }

  setContent(content) {
    this.content = content;
  }

  type(text) {
    this.content += text;
  }

  delete(length) {
    this.content = this.content.slice(0, -length);
  }
}

class TypeCommand {
  constructor(editor, text) {
    this.editor = editor;
    this.text = text;
  }

  execute() {
    this.editor.type(this.text);
  }

  undo() {
    this.editor.delete(this.text.length);
  }
}

class DeleteCommand {
  constructor(editor, length) {
    this.editor = editor;
    this.length = length;
    this.deletedText = '';
  }

  execute() {
    const content = this.editor.getContent();
    this.deletedText = content.slice(-this.length);
    this.editor.delete(this.length);
  }

  undo() {
    this.editor.type(this.deletedText);
  }
}

class CommandManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  execute(command) {
    // Remove any commands after current index (for redo)
    this.history = this.history.slice(0, this.currentIndex + 1);

    command.execute();
    this.history.push(command);
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].undo();
      this.currentIndex--;
    } else {
      console.log('Nothing to undo');
    }
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.history[this.currentIndex].execute();
    } else {
      console.log('Nothing to redo');
    }
  }
}

// Usage
const editor = new TextEditor();
const manager = new CommandManager();

manager.execute(new TypeCommand(editor, 'Hello '));
console.log(editor.getContent()); // "Hello "

manager.execute(new TypeCommand(editor, 'World'));
console.log(editor.getContent()); // "Hello World"

manager.undo();
console.log(editor.getContent()); // "Hello "

manager.redo();
console.log(editor.getContent()); // "Hello World"

manager.execute(new DeleteCommand(editor, 5));
console.log(editor.getContent()); // "Hello "

manager.undo();
console.log(editor.getContent()); // "Hello World"
```

```javascript
// Macro Command (Composite of commands)
class MacroCommand {
  constructor() {
    this.commands = [];
  }

  add(command) {
    this.commands.push(command);
  }

  execute() {
    this.commands.forEach(command => command.execute());
  }

  undo() {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

// Usage
const bedroom = new Light();
const kitchen = new Light();

const bedroomOn = new TurnOnCommand(bedroom);
const kitchenOn = new TurnOnCommand(kitchen);

const allLightsOn = new MacroCommand();
allLightsOn.add(bedroomOn);
allLightsOn.add(kitchenOn);

const remote2 = new RemoteControl();
remote2.execute(allLightsOn); // Both lights ON
remote2.undo();               // Both lights OFF
```

### ✅ Pros
- Decouples sender from receiver
- Easy to add new commands
- Supports undo/redo
- Supports queuing and logging
- Follows Open/Closed Principle
- Follows Single Responsibility Principle

### ❌ Cons
- Increases number of classes
- Can be overkill for simple operations

### 🔗 Related Patterns
- **Memento**: Used for undo mechanism
- **Composite**: Macro commands
- **Chain of Responsibility**: Can be used together

---

## 4. Iterator Pattern

### 📋 Intent
Provide a way to access elements of a collection sequentially without exposing its underlying representation.

### 🔧 When to Use
- When you need to traverse a complex data structure
- When you want to provide multiple traversal methods
- When you want to hide the internal structure
- Trees, graphs, custom collections

### ⚠️ When NOT to Use
- For simple arrays (use built-in methods)
- When direct access is more appropriate

### 💡 Real-World Analogy
A TV remote's channel button. You navigate through channels one by one without knowing the internal channel list structure.

### 📝 JavaScript Implementation

```javascript
// Iterator Interface
class Iterator {
  constructor(collection) {
    this.collection = collection;
    this.index = 0;
  }

  hasNext() {
    return this.index < this.collection.length;
  }

  next() {
    return this.collection[this.index++];
  }

  current() {
    return this.collection[this.index];
  }

  reset() {
    this.index = 0;
  }
}

// Usage
const items = ['A', 'B', 'C', 'D'];
const iterator = new Iterator(items);

while (iterator.hasNext()) {
  console.log(iterator.next());
}
```

```javascript
// ES6 Iterator Protocol
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;

    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
}

// Usage
const range = new Range(1, 5);

// Using for...of
for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// Using spread operator
console.log([...range]); // [1, 2, 3, 4, 5]
```

```javascript
// Real-world: Custom Collection with Multiple Iterators
class BookShelf {
  constructor() {
    this.books = [];
  }

  addBook(book) {
    this.books.push(book);
  }

  // Forward iterator
  createForwardIterator() {
    let index = 0;
    const books = this.books;

    return {
      hasNext() {
        return index < books.length;
      },
      next() {
        return books[index++];
      }
    };
  }

  // Reverse iterator
  createReverseIterator() {
    let index = this.books.length - 1;
    const books = this.books;

    return {
      hasNext() {
        return index >= 0;
      },
      next() {
        return books[index--];
      }
    };
  }

  // Filter iterator
  createFilterIterator(predicate) {
    let index = 0;
    const books = this.books;

    return {
      hasNext() {
        while (index < books.length) {
          if (predicate(books[index])) {
            return true;
          }
          index++;
        }
        return false;
      },
      next() {
        return books[index++];
      }
    };
  }

  [Symbol.iterator]() {
    return this.createForwardIterator();
  }
}

// Usage
const shelf = new BookShelf();
shelf.addBook({ title: 'JavaScript', year: 2020 });
shelf.addBook({ title: 'Python', year: 2019 });
shelf.addBook({ title: 'Java', year: 2021 });

console.log('Forward:');
const forward = shelf.createForwardIterator();
while (forward.hasNext()) {
  console.log(forward.next().title);
}

console.log('\nReverse:');
const reverse = shelf.createReverseIterator();
while (reverse.hasNext()) {
  console.log(reverse.next().title);
}

console.log('\nRecent books (>= 2020):');
const recent = shelf.createFilterIterator(book => book.year >= 2020);
while (recent.hasNext()) {
  console.log(recent.next().title);
}

console.log('\nUsing for...of:');
for (const book of shelf) {
  console.log(book.title);
}
```

```javascript
// Tree Traversal Iterator
class TreeNode {
  constructor(value) {
    this.value = value;
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
  }

  // Depth-first iterator
  *depthFirst() {
    yield this.value;
    for (const child of this.children) {
      yield* child.depthFirst();
    }
  }

  // Breadth-first iterator
  *breadthFirst() {
    const queue = [this];

    while (queue.length > 0) {
      const node = queue.shift();
      yield node.value;
      queue.push(...node.children);
    }
  }
}

// Usage
const root = new TreeNode('A');
const b = new TreeNode('B');
const c = new TreeNode('C');
const d = new TreeNode('D');
const e = new TreeNode('E');

root.addChild(b);
root.addChild(c);
b.addChild(d);
b.addChild(e);

console.log('Depth-first:');
for (const value of root.depthFirst()) {
  console.log(value); // A, B, D, E, C
}

console.log('\nBreadth-first:');
for (const value of root.breadthFirst()) {
  console.log(value); // A, B, C, D, E
}
```

### ✅ Pros
- Simplifies traversal of complex structures
- Multiple traversal algorithms
- Hides internal structure
- Follows Single Responsibility Principle
- Follows Open/Closed Principle

### ❌ Cons
- Overkill for simple collections
- Can be less efficient than direct access

### 🔗 Related Patterns
- **Composite**: Iterator often used with Composite
- **Factory**: Can create different iterators
- **Memento**: Can use for iteration state

---

## 5. State Pattern

### 📋 Intent
Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.

### 🔧 When to Use
- When object behavior depends on its state
- When you have large conditional statements based on state
- Workflow systems, game characters, UI components
- When state transitions are well-defined

### ⚠️ When NOT to Use
- When you have only a few states
- When state transitions are simple

### 💡 Real-World Analogy
A vending machine behaves differently based on its state: waiting for money, has partial payment, dispensing item, out of stock.

### 📝 JavaScript Implementation

```javascript
// State Interface
class State {
  insertCoin(machine) {}
  ejectCoin(machine) {}
  pressButton(machine) {}
  dispense(machine) {}
}

// Concrete States
class NoCoinState extends State {
  insertCoin(machine) {
    console.log('Coin inserted');
    machine.setState(machine.hasCoinState);
  }

  ejectCoin(machine) {
    console.log('No coin to eject');
  }

  pressButton(machine) {
    console.log('Insert coin first');
  }

  dispense(machine) {
    console.log('Insert coin first');
  }
}

class HasCoinState extends State {
  insertCoin(machine) {
    console.log('Coin already inserted');
  }

  ejectCoin(machine) {
    console.log('Coin ejected');
    machine.setState(machine.noCoinState);
  }

  pressButton(machine) {
    console.log('Button pressed');
    if (machine.count > 0) {
      machine.setState(machine.dispensingState);
    } else {
      console.log('Out of stock');
      machine.setState(machine.outOfStockState);
    }
  }

  dispense(machine) {
    console.log('Press button first');
  }
}

class DispensingState extends State {
  insertCoin(machine) {
    console.log('Please wait, dispensing item');
  }

  ejectCoin(machine) {
    console.log('Cannot eject, already dispensing');
  }

  pressButton(machine) {
    console.log('Already dispensing');
  }

  dispense(machine) {
    console.log('Dispensing item...');
    machine.count--;
    if (machine.count > 0) {
      machine.setState(machine.noCoinState);
    } else {
      console.log('Machine is now out of stock');
      machine.setState(machine.outOfStockState);
    }
  }
}

class OutOfStockState extends State {
  insertCoin(machine) {
    console.log('Out of stock, coin ejected');
  }

  ejectCoin(machine) {
    console.log('No coin to eject');
  }

  pressButton(machine) {
    console.log('Out of stock');
  }

  dispense(machine) {
    console.log('Out of stock');
  }
}

// Context
class VendingMachine {
  constructor(count) {
    this.count = count;

    this.noCoinState = new NoCoinState();
    this.hasCoinState = new HasCoinState();
    this.dispensingState = new DispensingState();
    this.outOfStockState = new OutOfStockState();

    this.state = count > 0 ? this.noCoinState : this.outOfStockState;
  }

  setState(state) {
    this.state = state;
  }

  insertCoin() {
    this.state.insertCoin(this);
  }

  ejectCoin() {
    this.state.ejectCoin(this);
  }

  pressButton() {
    this.state.pressButton(this);
    this.state.dispense(this);
  }

  refill(count) {
    this.count = count;
    this.state = this.noCoinState;
    console.log(`Machine refilled with ${count} items`);
  }
}

// Usage
const machine = new VendingMachine(2);

machine.insertCoin();   // Coin inserted
machine.pressButton();  // Button pressed, Dispensing item...

machine.insertCoin();   // Coin inserted
machine.ejectCoin();    // Coin ejected

machine.insertCoin();   // Coin inserted
machine.pressButton();  // Button pressed, Dispensing item..., Machine is now out of stock

machine.insertCoin();   // Out of stock, coin ejected

machine.refill(3);      // Machine refilled with 3 items
machine.insertCoin();   // Coin inserted
machine.pressButton();  // Button pressed, Dispensing item...
```

```javascript
// Real-world: Document Workflow
class DocumentState {
  publish(document) {}
  review(document) {}
  approve(document) {}
  reject(document) {}
}

class DraftState extends DocumentState {
  publish(document) {
    console.log('Publishing draft for review...');
    document.setState(new ReviewState());
  }

  review(document) {
    console.log('Cannot review a draft');
  }

  approve(document) {
    console.log('Cannot approve a draft');
  }

  reject(document) {
    console.log('Draft discarded');
  }
}

class ReviewState extends DocumentState {
  publish(document) {
    console.log('Already in review');
  }

  review(document) {
    console.log('Document is being reviewed');
  }

  approve(document) {
    console.log('Document approved!');
    document.setState(new PublishedState());
  }

  reject(document) {
    console.log('Document rejected, back to draft');
    document.setState(new DraftState());
  }
}

class PublishedState extends DocumentState {
  publish(document) {
    console.log('Already published');
  }

  review(document) {
    console.log('Published documents cannot be reviewed');
  }

  approve(document) {
    console.log('Already approved');
  }

  reject(document) {
    console.log('Unpublishing document');
    document.setState(new DraftState());
  }
}

class Document {
  constructor(title) {
    this.title = title;
    this.state = new DraftState();
  }

  setState(state) {
    this.state = state;
    console.log(`State changed to: ${state.constructor.name}\n`);
  }

  publish() {
    this.state.publish(this);
  }

  review() {
    this.state.review(this);
  }

  approve() {
    this.state.approve(this);
  }

  reject() {
    this.state.reject(this);
  }
}

// Usage
const doc = new Document('Design Patterns Article');

doc.publish();  // Publishing draft for review...
doc.review();   // Document is being reviewed
doc.approve();  // Document approved!
doc.publish();  // Already published
```

### ✅ Pros
- Organizes state-specific behavior
- Eliminates complex conditionals
- Follows Single Responsibility Principle
- Follows Open/Closed Principle
- Easy to add new states

### ❌ Cons
- Increases number of classes
- Overkill for simple state machines

### 🔗 Related Patterns
- **Strategy**: Similar structure, different intent
- **Flyweight**: Can share state objects
- **Singleton**: States often implemented as Singletons

---

## 6. Template Method Pattern

### 📋 Intent
Define the skeleton of an algorithm in a method, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps without changing the algorithm's structure.

### 🔧 When to Use
- When you want to let clients extend only particular steps of an algorithm
- When you have several classes with similar algorithms but different implementations
- Frameworks, data processing pipelines, game AI

### ⚠️ When NOT to Use
- When the algorithm varies significantly between implementations
- When you prefer composition over inheritance

### 💡 Real-World Analogy
A recipe for cooking. The steps are the same (prep ingredients, cook, serve), but the specific implementation of each step varies by dish.

### 📝 JavaScript Implementation

```javascript
// Abstract Class
class DataMiner {
  // Template method
  mine(path) {
    const file = this.openFile(path);
    const data = this.extractData(file);
    const parsed = this.parseData(data);
    const analysis = this.analyzeData(parsed);
    this.sendReport(analysis);
    this.closeFile(file);
  }

  openFile(path) {
    console.log(`Opening file: ${path}`);
    return `file_${path}`;
  }

  // Abstract methods - must be implemented by subclasses
  extractData(file) {
    throw new Error('extractData() must be implemented');
  }

  parseData(data) {
    throw new Error('parseData() must be implemented');
  }

  // Hook method - optional override
  analyzeData(data) {
    console.log('Analyzing data...');
    return `analysis_${data}`;
  }

  sendReport(analysis) {
    console.log(`Sending report: ${analysis}\n`);
  }

  closeFile(file) {
    console.log(`Closing file: ${file}`);
  }
}

// Concrete Classes
class PDFDataMiner extends DataMiner {
  extractData(file) {
    console.log('Extracting data from PDF');
    return `pdf_data_${file}`;
  }

  parseData(data) {
    console.log('Parsing PDF data');
    return `parsed_${data}`;
  }
}

class CSVDataMiner extends DataMiner {
  extractData(file) {
    console.log('Extracting data from CSV');
    return `csv_data_${file}`;
  }

  parseData(data) {
    console.log('Parsing CSV data');
    return `parsed_${data}`;
  }

  // Override hook for custom analysis
  analyzeData(data) {
    console.log('Performing advanced CSV analysis');
    return `advanced_analysis_${data}`;
  }
}

// Usage
const pdfMiner = new PDFDataMiner();
pdfMiner.mine('document.pdf');

const csvMiner = new CSVDataMiner();
csvMiner.mine('data.csv');
```

```javascript
// Real-world: Build Process
class BuildProcess {
  build() {
    console.log('=== Starting Build Process ===\n');
    this.checkDependencies();
    this.compile();
    this.test();
    this.package();
    this.deploy();
    console.log('=== Build Complete ===\n');
  }

  checkDependencies() {
    console.log('Checking dependencies...');
  }

  compile() {
    throw new Error('compile() must be implemented');
  }

  test() {
    console.log('Running tests...');
  }

  package() {
    throw new Error('package() must be implemented');
  }

  deploy() {
    console.log('Deploying...');
  }
}

class JavaBuild extends BuildProcess {
  compile() {
    console.log('Compiling Java source files with javac');
  }

  package() {
    console.log('Packaging into JAR file');
  }
}

class NodeBuild extends BuildProcess {
  compile() {
    console.log('Transpiling TypeScript to JavaScript');
  }

  package() {
    console.log('Creating NPM package');
  }

  deploy() {
    console.log('Deploying to NPM registry');
  }
}

// Usage
const javaBuild = new JavaBuild();
javaBuild.build();

const nodeBuild = new NodeBuild();
nodeBuild.build();
```

### ✅ Pros
- Code reuse (common logic in base class)
- Follows Open/Closed Principle
- Controls algorithm structure
- Easy to understand algorithm flow

### ❌ Cons
- Limited by inheritance
- Violates Liskov Substitution if not careful
- Can be rigid

### 🔗 Related Patterns
- **Strategy**: Changes entire algorithm, Template Method changes parts
- **Factory Method**: Often called by Template Methods
- **Hook Methods**: Optional steps in template

---

## 7. Chain of Responsibility Pattern

### 📋 Intent
Avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request. Chain the receiving objects and pass the request along the chain until an object handles it.

### 🔧 When to Use
- When multiple objects can handle a request
- When the handler isn't known in advance
- When you want to issue a request to one of several objects without specifying the receiver explicitly
- Middleware, event bubbling, logging levels

### ⚠️ When NOT to Use
- When every request must be handled
- When the chain is very long (performance)

### 💡 Real-World Analogy
Customer support system: First contact → Junior support → Senior support → Manager. Each level tries to solve the problem, passing to the next level if they can't.

### 📝 JavaScript Implementation

```javascript
// Handler
class Handler {
  setNext(handler) {
    this.nextHandler = handler;
    return handler; // For chaining
  }

  handle(request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

// Concrete Handlers
class AuthenticationHandler extends Handler {
  handle(request) {
    if (!request.isAuthenticated) {
      console.log('❌ Authentication failed');
      return false;
    }
    console.log('✅ Authentication passed');
    return super.handle(request);
  }
}

class AuthorizationHandler extends Handler {
  handle(request) {
    if (!request.hasPermission) {
      console.log('❌ Authorization failed');
      return false;
    }
    console.log('✅ Authorization passed');
    return super.handle(request);
  }
}

class ValidationHandler extends Handler {
  handle(request) {
    if (!request.isValid) {
      console.log('❌ Validation failed');
      return false;
    }
    console.log('✅ Validation passed');
    return super.handle(request);
  }
}

class ProcessHandler extends Handler {
  handle(request) {
    console.log('✅ Processing request');
    return true;
  }
}

// Usage
const auth = new AuthenticationHandler();
const authz = new AuthorizationHandler();
const validation = new ValidationHandler();
const process = new ProcessHandler();

// Build chain
auth.setNext(authz).setNext(validation).setNext(process);

// Test requests
console.log('Request 1:');
auth.handle({
  isAuthenticated: true,
  hasPermission: true,
  isValid: true
});

console.log('\nRequest 2:');
auth.handle({
  isAuthenticated: true,
  hasPermission: false,
  isValid: true
});

console.log('\nRequest 3:');
auth.handle({
  isAuthenticated: false,
  hasPermission: true,
  isValid: true
});
```

```javascript
// Real-world: Expense Approval System
class Approver {
  constructor(name, limit) {
    this.name = name;
    this.limit = limit;
    this.nextApprover = null;
  }

  setNext(approver) {
    this.nextApprover = approver;
    return approver;
  }

  approve(amount) {
    if (amount <= this.limit) {
      console.log(`${this.name} approved $${amount}`);
      return true;
    } else if (this.nextApprover) {
      console.log(`${this.name} cannot approve $${amount}, forwarding...`);
      return this.nextApprover.approve(amount);
    } else {
      console.log(`${this.name} cannot approve $${amount}, no one can!`);
      return false;
    }
  }
}

// Usage
const teamLead = new Approver('Team Lead', 1000);
const manager = new Approver('Manager', 5000);
const director = new Approver('Director', 10000);
const ceo = new Approver('CEO', 100000);

teamLead.setNext(manager).setNext(director).setNext(ceo);

console.log('Expense 1:');
teamLead.approve(500);    // Team Lead approves

console.log('\nExpense 2:');
teamLead.approve(3000);   // Manager approves

console.log('\nExpense 3:');
teamLead.approve(7500);   // Director approves

console.log('\nExpense 4:');
teamLead.approve(50000);  // CEO approves

console.log('\nExpense 5:');
teamLead.approve(200000); // No one can approve
```

```javascript
// Express.js Style Middleware
class Middleware {
  constructor() {
    this.middlewares = [];
  }

  use(fn) {
    this.middlewares.push(fn);
  }

  execute(context) {
    let index = 0;

    const next = () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware(context, next);
      }
    };

    next();
  }
}

// Usage
const app = new Middleware();

app.use((ctx, next) => {
  console.log('Middleware 1: Logging');
  console.log(`Request: ${ctx.url}`);
  next();
});

app.use((ctx, next) => {
  console.log('Middleware 2: Authentication');
  if (ctx.user) {
    next();
  } else {
    console.log('Not authenticated!');
  }
});

app.use((ctx, next) => {
  console.log('Middleware 3: Route Handler');
  console.log(`Handling ${ctx.url}`);
});

app.execute({ url: '/api/users', user: 'John' });
console.log('\n');
app.execute({ url: '/api/users', user: null });
```

### ✅ Pros
- Decouples sender and receiver
- Single Responsibility Principle
- Open/Closed Principle
- Control over request handling order

### ❌ Cons
- Some requests may go unhandled
- Can be hard to debug
- Performance concerns with long chains

### 🔗 Related Patterns
- **Composite**: Often used together
- **Command**: Can be used with Chain of Responsibility
- **Decorator**: Similar structure, different intent

---

## 8. Mediator Pattern

### 📋 Intent
Define an object that encapsulates how a set of objects interact. Promotes loose coupling by keeping objects from referring to each other explicitly.

### 🔧 When to Use
- When a set of objects communicate in complex ways
- When reusing objects is difficult due to dependencies
- When you want to centralize complex communications
- Chat rooms, air traffic control, UI component coordination

### ⚠️ When NOT to Use
- When objects have simple relationships
- When the mediator becomes too complex (God object)

### 💡 Real-World Analogy
Air traffic control tower. Pilots don't communicate directly with each other; they communicate with the tower, which coordinates all flights.

### 📝 JavaScript Implementation

```javascript
// Mediator
class ChatRoom {
  constructor() {
    this.users = {};
  }

  register(user) {
    this.users[user.name] = user;
    user.chatRoom = this;
  }

  send(message, from, to) {
    if (to) {
      // Private message
      to.receive(message, from);
    } else {
      // Broadcast to all except sender
      Object.values(this.users).forEach(user => {
        if (user !== from) {
          user.receive(message, from);
        }
      });
    }
  }
}

// Colleague
class User {
  constructor(name) {
    this.name = name;
    this.chatRoom = null;
  }

  send(message, to) {
    console.log(`${this.name} sends: ${message}`);
    this.chatRoom.send(message, this, to);
  }

  receive(message, from) {
    console.log(`${this.name} receives from ${from.name}: ${message}`);
  }
}

// Usage
const chatRoom = new ChatRoom();

const john = new User('John');
const jane = new User('Jane');
const bob = new User('Bob');

chatRoom.register(john);
chatRoom.register(jane);
chatRoom.register(bob);

john.send('Hello everyone!');
console.log();

jane.send('Hi John!', john);
console.log();

bob.send('Hey guys!');
```

```javascript
// Real-world: Smart Home System
class SmartHomeMediator {
  constructor() {
    this.devices = {};
  }

  registerDevice(device) {
    this.devices[device.name] = device;
    device.setMediator(this);
  }

  notify(sender, event) {
    console.log(`\nMediator: Received ${event} from ${sender.name}`);

    if (sender.name === 'MotionSensor' && event === 'motion_detected') {
      this.devices['Light'].turnOn();
      this.devices['Camera'].startRecording();
    }

    if (sender.name === 'MotionSensor' && event === 'no_motion') {
      this.devices['Light'].turnOff();
      this.devices['Camera'].stopRecording();
    }

    if (sender.name === 'Thermostat' && event === 'temp_high') {
      this.devices['AC'].turnOn();
    }

    if (sender.name === 'Thermostat' && event === 'temp_normal') {
      this.devices['AC'].turnOff();
    }
  }
}

class SmartDevice {
  constructor(name) {
    this.name = name;
    this.mediator = null;
  }

  setMediator(mediator) {
    this.mediator = mediator;
  }
}

class MotionSensor extends SmartDevice {
  detectMotion() {
    console.log(`${this.name}: Motion detected!`);
    this.mediator.notify(this, 'motion_detected');
  }

  clearMotion() {
    console.log(`${this.name}: No motion`);
    this.mediator.notify(this, 'no_motion');
  }
}

class Light extends SmartDevice {
  turnOn() {
    console.log(`${this.name}: Turning ON`);
  }

  turnOff() {
    console.log(`${this.name}: Turning OFF`);
  }
}

class Camera extends SmartDevice {
  startRecording() {
    console.log(`${this.name}: Started recording`);
  }

  stopRecording() {
    console.log(`${this.name}: Stopped recording`);
  }
}

class Thermostat extends SmartDevice {
  setTemperature(temp) {
    console.log(`${this.name}: Temperature set to ${temp}°C`);
    if (temp > 25) {
      this.mediator.notify(this, 'temp_high');
    } else {
      this.mediator.notify(this, 'temp_normal');
    }
  }
}

class AC extends SmartDevice {
  turnOn() {
    console.log(`${this.name}: Cooling ON`);
  }

  turnOff() {
    console.log(`${this.name}: Cooling OFF`);
  }
}

// Usage
const homeMediator = new SmartHomeMediator();

const motionSensor = new MotionSensor('MotionSensor');
const light = new Light('Light');
const camera = new Camera('Camera');
const thermostat = new Thermostat('Thermostat');
const ac = new AC('AC');

homeMediator.registerDevice(motionSensor);
homeMediator.registerDevice(light);
homeMediator.registerDevice(camera);
homeMediator.registerDevice(thermostat);
homeMediator.registerDevice(ac);

motionSensor.detectMotion();
setTimeout(() => motionSensor.clearMotion(), 1000);

setTimeout(() => thermostat.setTemperature(28), 2000);
setTimeout(() => thermostat.setTemperature(22), 3000);
```

### ✅ Pros
- Reduces coupling between components
- Centralizes control
- Simplifies object protocols
- Easier to understand communication flow

### ❌ Cons
- Mediator can become complex (God object)
- Can be harder to maintain if it grows too large

### 🔗 Related Patterns
- **Observer**: Mediator uses Observer-like communication
- **Facade**: Mediator abstracts communication, Facade abstracts interface
- **Singleton**: Mediator often implemented as Singleton

---

## 9. Memento Pattern

### 📋 Intent
Capture and externalize an object's internal state without violating encapsulation, so the object can be restored to this state later.

### 🔧 When to Use
- When you need to save/restore object state
- When direct access to state would violate encapsulation
- Undo/redo functionality
- Snapshots, checkpoints, save games

### ⚠️ When NOT to Use
- When state is simple and can be easily copied
- When memory usage is a concern (many mementos)

### 💡 Real-World Analogy
Video game save points. You can save your game progress and restore it later without exposing internal game state.

### 📝 JavaScript Implementation

```javascript
// Memento
class EditorMemento {
  constructor(content, cursorPosition) {
    this.content = content;
    this.cursorPosition = cursorPosition;
    this.timestamp = new Date();
  }

  getState() {
    return {
      content: this.content,
      cursorPosition: this.cursorPosition,
      timestamp: this.timestamp
    };
  }
}

// Originator
class TextEditor {
  constructor() {
    this.content = '';
    this.cursorPosition = 0;
  }

  type(text) {
    this.content += text;
    this.cursorPosition += text.length;
  }

  deleteText(length) {
    this.content = this.content.slice(0, -length);
    this.cursorPosition = Math.max(0, this.cursorPosition - length);
  }

  getContent() {
    return this.content;
  }

  save() {
    console.log('Saving state...');
    return new EditorMemento(this.content, this.cursorPosition);
  }

  restore(memento) {
    console.log('Restoring state...');
    const state = memento.getState();
    this.content = state.content;
    this.cursorPosition = state.cursorPosition;
  }
}

// Caretaker
class History {
  constructor() {
    this.mementos = [];
    this.currentIndex = -1;
  }

  save(memento) {
    // Remove any mementos after current index
    this.mementos = this.mementos.slice(0, this.currentIndex + 1);
    this.mementos.push(memento);
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.mementos[this.currentIndex];
    }
    console.log('Nothing to undo');
    return null;
  }

  redo() {
    if (this.currentIndex < this.mementos.length - 1) {
      this.currentIndex++;
      return this.mementos[this.currentIndex];
    }
    console.log('Nothing to redo');
    return null;
  }

  showHistory() {
    console.log('\n=== History ===');
    this.mementos.forEach((memento, index) => {
      const state = memento.getState();
      const marker = index === this.currentIndex ? '→' : ' ';
      console.log(`${marker} ${index}: "${state.content}" at ${state.timestamp.toLocaleTimeString()}`);
    });
  }
}

// Usage
const editor = new TextEditor();
const history = new History();

editor.type('Hello ');
history.save(editor.save());

editor.type('World');
history.save(editor.save());

editor.type('!');
history.save(editor.save());

console.log('Current:', editor.getContent()); // Hello World!

const undoState = history.undo();
if (undoState) editor.restore(undoState);
console.log('After undo:', editor.getContent()); // Hello World

const undoState2 = history.undo();
if (undoState2) editor.restore(undoState2);
console.log('After undo:', editor.getContent()); // Hello

const redoState = history.redo();
if (redoState) editor.restore(redoState);
console.log('After redo:', editor.getContent()); // Hello World

history.showHistory();
```

```javascript
// Real-world: Game State
class GameMemento {
  constructor(level, score, health, position) {
    this.level = level;
    this.score = score;
    this.health = health;
    this.position = { ...position };
  }
}

class Game {
  constructor() {
    this.level = 1;
    this.score = 0;
    this.health = 100;
    this.position = { x: 0, y: 0 };
  }

  play(actions) {
    console.log(`\nPlaying level ${this.level}...`);
    this.score += actions.score || 0;
    this.health += actions.healthChange || 0;
    this.position.x += actions.moveX || 0;
    this.position.y += actions.moveY || 0;

    if (actions.levelComplete) {
      this.level++;
    }

    this.displayStatus();
  }

  displayStatus() {
    console.log(`Level: ${this.level}, Score: ${this.score}, Health: ${this.health}, Position: (${this.position.x}, ${this.position.y})`);
  }

  save() {
    console.log('💾 Game saved');
    return new GameMemento(this.level, this.score, this.health, this.position);
  }

  restore(memento) {
    console.log('📂 Loading save...');
    this.level = memento.level;
    this.score = memento.score;
    this.health = memento.health;
    this.position = { ...memento.position };
    this.displayStatus();
  }
}

// Usage
const game = new Game();
game.displayStatus();

game.play({ score: 100, moveX: 10, moveY: 5 });
const checkpoint1 = game.save();

game.play({ score: 50, healthChange: -20, moveX: 5 });
const checkpoint2 = game.save();

game.play({ score: 200, levelComplete: true, healthChange: -30 });

console.log('\n--- Player died! Restoring checkpoint 2 ---');
game.restore(checkpoint2);

game.play({ score: 150, levelComplete: true });

console.log('\n--- Want to replay from checkpoint 1 ---');
game.restore(checkpoint1);
```

### ✅ Pros
- Preserves encapsulation
- Simplifies originator
- Easy undo/redo implementation

### ❌ Cons
- Memory overhead with many mementos
- Caretaker must track memento lifecycle
- Can be expensive if state is large

### 🔗 Related Patterns
- **Command**: Can use Memento for undo
- **Iterator**: Can use Memento to capture iteration state
- **Prototype**: Memento is like a snapshot, Prototype clones

---

## 10. Visitor Pattern

### 📋 Intent
Represent an operation to be performed on elements of an object structure. Visitor lets you define a new operation without changing the classes of the elements.

### 🔧 When to Use
- When you need to perform operations on all elements of a complex structure
- When you want to add new operations without modifying existing classes
- When operations are unrelated to element classes
- Compilers, file systems, document processing

### ⚠️ When NOT to Use
- When element classes change frequently
- When the structure is simple

### 💡 Real-World Analogy
Insurance agent visiting different types of buildings (residential, commercial, industrial). The agent performs different evaluations based on building type without changing the building classes.

### 📝 JavaScript Implementation

```javascript
// Visitor Interface
class Visitor {
  visitCircle(circle) {}
  visitRectangle(rectangle) {}
  visitTriangle(triangle) {}
}

// Concrete Visitors
class AreaCalculator extends Visitor {
  visitCircle(circle) {
    const area = Math.PI * circle.radius ** 2;
    console.log(`Circle area: ${area.toFixed(2)}`);
    return area;
  }

  visitRectangle(rectangle) {
    const area = rectangle.width * rectangle.height;
    console.log(`Rectangle area: ${area}`);
    return area;
  }

  visitTriangle(triangle) {
    const area = (triangle.base * triangle.height) / 2;
    console.log(`Triangle area: ${area}`);
    return area;
  }
}

class PerimeterCalculator extends Visitor {
  visitCircle(circle) {
    const perimeter = 2 * Math.PI * circle.radius;
    console.log(`Circle perimeter: ${perimeter.toFixed(2)}`);
    return perimeter;
  }

  visitRectangle(rectangle) {
    const perimeter = 2 * (rectangle.width + rectangle.height);
    console.log(`Rectangle perimeter: ${perimeter}`);
    return perimeter;
  }

  visitTriangle(triangle) {
    // Assuming equilateral for simplicity
    const perimeter = triangle.base * 3;
    console.log(`Triangle perimeter: ${perimeter}`);
    return perimeter;
  }
}

// Element Interface
class Shape {
  accept(visitor) {}
}

// Concrete Elements
class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  accept(visitor) {
    return visitor.visitCircle(this);
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  accept(visitor) {
    return visitor.visitRectangle(this);
  }
}

class Triangle extends Shape {
  constructor(base, height) {
    super();
    this.base = base;
    this.height = height;
  }

  accept(visitor) {
    return visitor.visitTriangle(this);
  }
}

// Usage
const shapes = [
  new Circle(5),
  new Rectangle(4, 6),
  new Triangle(3, 4)
];

console.log('=== Calculating Areas ===');
const areaCalculator = new AreaCalculator();
shapes.forEach(shape => shape.accept(areaCalculator));

console.log('\n=== Calculating Perimeters ===');
const perimeterCalculator = new PerimeterCalculator();
shapes.forEach(shape => shape.accept(perimeterCalculator));
```

```javascript
// Real-world: File System Export
class ExportVisitor {
  visitFile(file) {}
  visitDirectory(directory) {}
}

class XMLExporter extends ExportVisitor {
  visitFile(file) {
    return `<file name="${file.name}" size="${file.size}"/>`;
  }

  visitDirectory(directory) {
    const children = directory.children
      .map(child => child.accept(this))
      .join('\n  ');

    return `<directory name="${directory.name}">\n  ${children}\n</directory>`;
  }
}

class JSONExporter extends ExportVisitor {
  visitFile(file) {
    return {
      type: 'file',
      name: file.name,
      size: file.size
    };
  }

  visitDirectory(directory) {
    return {
      type: 'directory',
      name: directory.name,
      children: directory.children.map(child => child.accept(this))
    };
  }
}

class FileSystemNode {
  accept(visitor) {}
}

class File extends FileSystemNode {
  constructor(name, size) {
    super();
    this.name = name;
    this.size = size;
  }

  accept(visitor) {
    return visitor.visitFile(this);
  }
}

class Directory extends FileSystemNode {
  constructor(name) {
    super();
    this.name = name;
    this.children = [];
  }

  add(node) {
    this.children.push(node);
  }

  accept(visitor) {
    return visitor.visitDirectory(this);
  }
}

// Usage
const root = new Directory('root');
const home = new Directory('home');
const documents = new Directory('documents');

documents.add(new File('resume.pdf', 1024));
documents.add(new File('letter.docx', 512));

home.add(documents);
home.add(new File('photo.jpg', 2048));

root.add(home);
root.add(new File('readme.txt', 128));

console.log('=== XML Export ===');
const xmlExporter = new XMLExporter();
console.log(root.accept(xmlExporter));

console.log('\n=== JSON Export ===');
const jsonExporter = new JSONExporter();
console.log(JSON.stringify(root.accept(jsonExporter), null, 2));
```

### ✅ Pros
- Easy to add new operations
- Groups related operations
- Follows Single Responsibility Principle
- Follows Open/Closed Principle

### ❌ Cons
- Hard to add new element classes
- Breaks encapsulation
- Circular dependency between visitors and elements

### 🔗 Related Patterns
- **Composite**: Visitor often used with Composite structures
- **Iterator**: Can traverse structure that Visitor operates on
- **Strategy**: Similar structure, different intent

---

## Summary

### Quick Comparison

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Observer** | Notify dependents of changes | Event systems |
| **Strategy** | Interchangeable algorithms | Payment methods |
| **Command** | Encapsulate requests | Undo/redo |
| **Iterator** | Sequential access | Traversing collections |
| **State** | Change behavior with state | Workflow systems |
| **Template Method** | Define algorithm skeleton | Build processes |
| **Chain of Responsibility** | Pass request along chain | Middleware |
| **Mediator** | Centralize communication | Chat room |
| **Memento** | Capture and restore state | Save/load |
| **Visitor** | Add operations to structure | Export formats |

### Pattern Selection Guide

**Need event handling?** → **Observer**
**Need to swap algorithms?** → **Strategy**
**Need undo/redo?** → **Command** + **Memento**
**Need to traverse structure?** → **Iterator**
**Behavior changes with state?** → **State**
**Define algorithm template?** → **Template Method**
**Chain of handlers?** → **Chain of Responsibility**
**Coordinate multiple objects?** → **Mediator**
**Save/restore state?** → **Memento**
**Add operations without modifying classes?** → **Visitor**

---

## Congratulations!

You've completed all three pattern categories:

📖 **[← Structural Patterns](./STRUCTURAL_PATTERNS.md)**

📖 **[← Creational Patterns](./CREATIONAL_PATTERNS.md)**

📖 **[← Main Guide](../DESIGN_PATTERNS_BEGINNER_GUIDE.md)**

### Next Steps:
1. Practice implementing these patterns in your projects
2. Review the patterns periodically
3. Study real-world codebases to see patterns in action
4. Remember: Use patterns when they solve a problem, not for the sake of using them!

Happy coding! 🚀
