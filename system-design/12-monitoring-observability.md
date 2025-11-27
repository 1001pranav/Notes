# Monitoring, Logging, and Observability

## Table of Contents
- [Monitoring vs Observability](#monitoring-vs-observability)
- [The Three Pillars of Observability](#the-three-pillars-of-observability)
- [Metrics](#metrics)
- [Logging](#logging)
- [Distributed Tracing](#distributed-tracing)
- [Alerting](#alerting)
- [SLA, SLO, and SLI](#sla-slo-and-sli)
- [Monitoring Tools and Stacks](#monitoring-tools-and-stacks)
- [Best Practices](#best-practices)

---

## Monitoring vs Observability

### Monitoring

**Definition:** Tracking predefined metrics and alerts to understand system health.

```
Known Problems → Define Metrics → Set Alerts → Monitor
```

**Example:**
```javascript
// Monitor CPU usage
if (cpuUsage > 80%) {
  sendAlert("High CPU usage");
}
```

**Characteristics:**
- Reactive
- Predefined metrics
- Known failure modes
- Answers: "Is the system working?"

### Observability

**Definition:** Ability to understand internal system state from external outputs, enabling investigation of unknown problems.

```
Unknown Problems → Collect Rich Data → Explore → Understand
```

**Example:**
```javascript
// With observability, you can answer:
// "Why did this specific user's request take 10 seconds?"
// "What caused the spike in latency at 3 AM?"
// "Which microservice is causing cascade failures?"
```

**Characteristics:**
- Proactive
- Rich, contextual data
- Unknown failure modes
- Answers: "Why is it not working?"

### Monitoring + Observability

Modern systems need both:
- **Monitoring** for known issues
- **Observability** for debugging unknown issues

---

## The Three Pillars of Observability

### 1. Metrics (Numbers)
Numerical measurements over time

### 2. Logs (Text)
Timestamped records of events

### 3. Traces (Flow)
Request path through distributed system

```
User Request
    ↓
[ Metrics ]  → CPU: 45%, Latency: 120ms
[ Logs ]     → "User 123 requested /api/orders"
[ Traces ]   → API Gateway → Auth Service → Order Service → Database
```

---

## Metrics

### What are Metrics?

Numerical measurements collected at regular intervals.

**Examples:**
- CPU usage: 45%
- Request rate: 1500 req/sec
- Error rate: 0.5%
- Response time: 120ms

### Types of Metrics

#### 1. Application Metrics

Performance and behavior of your application.

```javascript
// Express.js example
const promClient = require('prom-client');

// Counter - increases only
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

// Histogram - distribution of values
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request latency in milliseconds',
  buckets: [10, 50, 100, 200, 500, 1000, 2000]
});

// Gauge - can go up and down
const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    httpRequestsTotal.inc({
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode
    });

    httpRequestDuration.observe(duration);
  });

  next();
});
```

**Common Application Metrics:**
- Request rate (requests/second)
- Error rate (%)
- Response time (p50, p95, p99)
- Active connections
- Queue depth
- Cache hit rate

#### 2. Infrastructure Metrics

System resources and performance.

```javascript
// Collect system metrics
const os = require('os');

setInterval(() => {
  // CPU usage
  const cpuUsage = os.loadavg()[0];
  cpuMetric.set(cpuUsage);

  // Memory usage
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = ((totalMem - freeMem) / totalMem) * 100;
  memoryMetric.set(memUsage);

  // Disk I/O, network I/O...
}, 10000);
```

**Common Infrastructure Metrics:**
- CPU utilization
- Memory usage
- Disk I/O
- Network throughput
- Disk space

#### 3. Business Metrics

Business-specific KPIs.

```javascript
// E-commerce example
const ordersCompleted = new promClient.Counter({
  name: 'orders_completed_total',
  help: 'Total completed orders'
});

const revenue = new promClient.Counter({
  name: 'revenue_total_dollars',
  help: 'Total revenue in dollars'
});

const cartAbandonment = new promClient.Gauge({
  name: 'cart_abandonment_rate',
  help: 'Percentage of abandoned carts'
});

// Track when order completes
app.post('/orders/:id/complete', async (req, res) => {
  const order = await completeOrder(req.params.id);

  ordersCompleted.inc();
  revenue.inc(order.total);

  res.json(order);
});
```

**Common Business Metrics:**
- Sign-ups per day
- Conversion rate
- Revenue
- Active users
- Feature usage

### Metric Aggregation

#### Percentiles

Understanding distribution, not just averages.

```
100 requests:
- 50 requests: 50ms (p50 - median)
- 95 requests: 200ms (p95)
- 99 requests: 500ms (p99)
- 1 request: 5000ms (outlier)

Average: 145ms (misleading!)
p95: 200ms (95% of users see ≤200ms)
p99: 500ms (99% of users see ≤500ms)
```

**Why p99 matters:**
```javascript
// User making 10 API calls
// Each call p99 = 1 second
// Probability user hits p99 latency:
// 1 - (0.99)^10 = 9.6%

// Nearly 10% of users experience slow requests!
```

#### Rate

Change over time.

```
requests_total: 1000 (counter)
rate(requests_total[1m]): 10 req/sec
```

### The RED Method

**R**ate, **E**rrors, **D**uration - Essential metrics for every service.

```
Rate: How many requests per second?
Errors: How many requests failed?
Duration: How long do requests take?
```

```javascript
// Prometheus queries
rate(http_requests_total[5m])  // Request rate
rate(http_requests_total{status=~"5.."}[5m])  // Error rate
histogram_quantile(0.95, http_request_duration_ms)  // p95 latency
```

### The USE Method

**U**tilization, **S**aturation, **E**rrors - For infrastructure resources.

```
Utilization: % time resource is busy
Saturation: Amount of queued work
Errors: Error count
```

**Example:**
```
CPU Utilization: 70%
CPU Saturation: Run queue length = 5
CPU Errors: Hardware errors
```

---

## Logging

### What are Logs?

Timestamped records of discrete events.

```
2025-01-15T10:30:45.123Z INFO User 123 logged in
2025-01-15T10:30:46.456Z ERROR Failed to connect to database: timeout
2025-01-15T10:30:47.789Z WARN High memory usage: 85%
```

### Log Levels

```javascript
logger.debug("Detailed debugging info");
logger.info("Informational message");
logger.warn("Warning - potential issue");
logger.error("Error occurred");
logger.fatal("Critical failure");
```

**When to use:**
- **DEBUG**: Development, troubleshooting
- **INFO**: Normal operations, audit trail
- **WARN**: Degraded performance, deprecations
- **ERROR**: Request failed, recoverable errors
- **FATAL**: Application crash, unrecoverable

### Structured Logging

Use JSON instead of plain text for easier parsing.

**Bad - Unstructured:**
```javascript
console.log("User John (id: 123) placed order 456 for $99.99");
// Hard to parse, query, filter
```

**Good - Structured:**
```javascript
logger.info("Order placed", {
  userId: 123,
  userName: "John",
  orderId: 456,
  amount: 99.99,
  currency: "USD"
});

// Output:
// {
//   "timestamp": "2025-01-15T10:30:45.123Z",
//   "level": "info",
//   "message": "Order placed",
//   "userId": 123,
//   "userName": "John",
//   "orderId": 456,
//   "amount": 99.99,
//   "currency": "USD"
// }
```

**Benefits:**
- Easy to query: `userId = 123`
- Easy to aggregate: `SUM(amount) WHERE event='Order placed'`
- Easy to filter: `level='error' AND service='payment'`

### Correlation IDs

Track requests across services.

```javascript
// API Gateway - Generate correlation ID
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || generateUUID();
  res.set('x-correlation-id', req.correlationId);
  next();
});

// Service A
logger.info("Received request", {
  correlationId: req.correlationId,
  endpoint: req.path
});

// Service B (downstream)
axios.get('http://service-b/api', {
  headers: { 'x-correlation-id': req.correlationId }
});

// Service B logs
logger.info("Processing request", {
  correlationId: req.correlationId,
  action: "validate_payment"
});

// Now you can search all logs by correlationId to see full request flow
```

### Centralized Logging

Aggregate logs from all services in one place.

```
[ Service A ] ──┐
[ Service B ] ──┼──→ [ Log Aggregator ] ──→ [ Log Storage ] ──→ [ Query/Visualize ]
[ Service C ] ──┘
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

**Architecture:**
```
Applications
    ↓ (send logs)
Logstash (collect, parse, transform)
    ↓
Elasticsearch (store, index)
    ↓
Kibana (visualize, query)
```

**Example - Winston + Elasticsearch:**
```javascript
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
  transports: [
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: 'http://localhost:9200' },
      index: 'logs'
    })
  ]
});

logger.info('User action', {
  userId: 123,
  action: 'purchase',
  amount: 99.99
});

// Query in Kibana:
// action: "purchase" AND amount > 50
```

### Log Sampling

For high-traffic systems, log only a sample.

```javascript
// Log 10% of successful requests, 100% of errors
app.use((req, res, next) => {
  const shouldLog = res.statusCode >= 400 || Math.random() < 0.1;

  if (shouldLog) {
    logger.info("Request processed", {
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  }

  next();
});
```

### What to Log

**DO Log:**
- Request start/end with timing
- Errors with stack traces
- Authentication events
- Database queries (slow queries)
- External API calls
- Business events (order placed, user signed up)
- Configuration changes

**DON'T Log:**
- Passwords, API keys, tokens
- Credit card numbers
- Personal identifiable information (PII) - or hash it
- High-frequency events without sampling

---

## Distributed Tracing

### What is Distributed Tracing?

Tracking a request's journey through multiple services.

```
User Request
    ↓
[ API Gateway ]  ──────────────── Span 1 (200ms)
    ↓
[ Auth Service ] ────── Span 2 (50ms)
    ↓
[ Order Service ] ──── Span 3 (100ms)
    ↓
[ Payment Service ] ── Span 4 (80ms)
    ↓
[ Database ] ────────── Span 5 (30ms)

Trace ID: abc123
Total Duration: 200ms
```

### Trace Components

**Trace**: End-to-end request flow
**Span**: Single operation within a trace
**Span Context**: Metadata (trace ID, span ID, parent span ID)

### OpenTelemetry Example

```javascript
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

// Initialize tracer
const provider = new NodeTracerProvider();
const exporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces'
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

const tracer = provider.getTracer('my-service');

// Create spans
app.get('/api/orders/:id', async (req, res) => {
  const span = tracer.startSpan('get_order');

  try {
    // Child span for database query
    const dbSpan = tracer.startSpan('database_query', {
      parent: span
    });
    const order = await db.getOrder(req.params.id);
    dbSpan.end();

    // Child span for external API
    const apiSpan = tracer.startSpan('payment_service_call', {
      parent: span
    });
    const payment = await paymentService.getPayment(order.paymentId);
    apiSpan.end();

    span.setAttributes({
      'order.id': order.id,
      'order.amount': order.total
    });

    res.json({ order, payment });
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.recordException(error);
    res.status(500).json({ error: error.message });
  } finally {
    span.end();
  }
});
```

### Benefits of Tracing

1. **Identify bottlenecks**: See which service is slow
2. **Understand dependencies**: Visualize service interactions
3. **Debug errors**: See exactly where request failed
4. **Performance optimization**: Find slow database queries, API calls

### Trace Visualization (Jaeger UI)

```
Timeline View:
|─────────────────────────────────────────| API Gateway (200ms)
  |──────| Auth (50ms)
           |──────────────| Order Service (100ms)
                      |──────| Payment (80ms)
                          |─| Database (30ms)
```

### Sampling Strategies

**100% Sampling:**
```javascript
// Trace every request
sampler: new AlwaysOnSampler()
```

**Probability-based:**
```javascript
// Trace 10% of requests
sampler: new TraceIdRatioBasedSampler(0.1)
```

**Error-based:**
```javascript
// Always trace errors, 1% of successes
if (error || Math.random() < 0.01) {
  // Create trace
}
```

---

## Alerting

### Alert Design

Good alerts answer: **"What's broken and needs human intervention?"**

**Bad Alert:**
```
CPU > 50% → Alert
// Too noisy, not actionable
```

**Good Alert:**
```
p95 latency > 1000ms for 5 minutes → Alert
// Affects users, needs investigation
```

### Alert Types

#### 1. Threshold-based

```
cpu_usage > 80% for 10 minutes → Alert
```

#### 2. Rate of change

```
error_rate increased by 50% in last 5 minutes → Alert
```

#### 3. Absence

```
No heartbeat from service in 2 minutes → Alert
```

### Alert Severity

**P1 - Critical**
- User-facing service down
- Data loss occurring
- Security breach
- Page on-call immediately

**P2 - High**
- Degraded performance
- Non-critical service down
- Send notification

**P3 - Medium**
- Warning signs
- Approaching thresholds
- Email summary

**P4 - Low**
- Informational
- Daily digest

### Alert Configuration (Prometheus)

```yaml
groups:
  - name: api_alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          description: "Error rate is {{ $value }}%"

      # High latency
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_ms) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "p95 latency is {{ $value }}ms"

      # Service down
      - alert: ServiceDown
        expr: up{job="api-server"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"
```

### Alert Fatigue Prevention

1. **Reduce noise**: Only alert on actionable issues
2. **Group related alerts**: Don't send 100 alerts for same issue
3. **Auto-resolve**: Clear alerts when issue fixes
4. **Set proper thresholds**: Avoid false positives
5. **Incident response**: Have runbooks for each alert

---

## SLA, SLO, and SLI

### SLI (Service Level Indicator)

Measurement of service quality.

**Examples:**
- Request latency
- Error rate
- Availability
- Throughput

```javascript
// SLI: Percentage of requests < 200ms
const successfulRequests = requests.filter(r => r.duration < 200).length;
const sli = (successfulRequests / requests.length) * 100;
// SLI = 99.5%
```

### SLO (Service Level Objective)

Target value for SLI.

**Examples:**
- 99.9% of requests complete in < 200ms
- 99.95% availability (4.38 hours downtime/year)
- < 0.1% error rate

```
SLO: 99.9% of requests < 200ms
Current SLI: 99.5%
Status: Not meeting SLO ❌
```

### SLA (Service Level Agreement)

Contract with users/customers, includes consequences.

**Example:**
```
SLA: 99.9% uptime
Violation consequence:
- 99.5-99.9%: 10% credit
- 99.0-99.5%: 25% credit
- < 99.0%: 50% credit
```

### Error Budget

Amount of downtime allowed while meeting SLO.

```
SLO: 99.9% availability
Error Budget: 0.1% downtime
Per month: 43.8 minutes
Per year: 8.76 hours

Current month:
- Used: 15 minutes
- Remaining: 28.8 minutes

If error budget exhausted:
- Pause feature releases
- Focus on reliability
- Investigate incidents
```

---

## Monitoring Tools and Stacks

### Prometheus + Grafana

**Prometheus**: Metrics collection and storage
**Grafana**: Visualization and dashboards

```javascript
// Expose metrics endpoint
const express = require('express');
const promClient = require('prom-client');

const app = express();

// Collect default metrics
promClient.collectDefaultMetrics();

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

**Prometheus config:**
```yaml
scrape_configs:
  - job_name: 'my-app'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
```

### DataDog

All-in-one observability platform (SaaS).

```javascript
const StatsD = require('node-dogstatsd').StatsD;
const client = new StatsD();

client.increment('page.views');
client.timing('page.load', 320);
client.gauge('users.online', 42);
```

### New Relic

APM (Application Performance Monitoring) platform.

### ELK/EFK Stack

**Elasticsearch**: Search and analytics
**Logstash/Fluentd**: Log collection
**Kibana**: Visualization

### Jaeger / Zipkin

Distributed tracing platforms.

---

## Best Practices

### 1. Implement Early

Build observability from day one, not after issues arise.

### 2. Use Consistent Naming

```javascript
// Good
http_requests_total
http_request_duration_seconds

// Bad
httpRequests
request_time_ms
```

### 3. Include Context

```javascript
logger.info("Order failed", {
  orderId: 123,
  userId: 456,
  reason: "Payment declined",
  amount: 99.99
});
```

### 4. Monitor What Matters

Focus on user-facing metrics, not vanity metrics.

### 5. Set Up Dashboards

Create dashboards for:
- Overall system health
- Individual services
- Business metrics
- On-call debugging

### 6. Automate Alerts

Don't rely on manual checking.

### 7. Practice Incident Response

Regular drills, runbooks for common issues.

### 8. Review Metrics Regularly

Weekly/monthly reviews to identify trends.

### 9. Respect User Privacy

Don't log sensitive data, comply with GDPR/CCPA.

### 10. Optimize Costs

- Sample high-volume logs
- Set retention policies
- Archive old data

---

## Complete Example

```javascript
const express = require('express');
const winston = require('winston');
const promClient = require('prom-client');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');

// Logging
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration',
  buckets: [10, 50, 100, 200, 500, 1000]
});

// Tracing
const tracerProvider = new NodeTracerProvider();
tracerProvider.register();
const tracer = tracerProvider.getTracer('my-app');

const app = express();

// Middleware
app.use((req, res, next) => {
  const span = tracer.startSpan(`${req.method} ${req.path}`);
  const start = Date.now();
  const correlationId = req.headers['x-correlation-id'] || generateUUID();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Metrics
    httpRequestsTotal.inc({
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode
    });
    httpRequestDuration.observe(duration);

    // Logging
    logger.info('Request processed', {
      correlationId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    });

    // Tracing
    span.setAttributes({
      'http.method': req.method,
      'http.url': req.path,
      'http.status_code': res.statusCode
    });
    span.end();
  });

  next();
});

// Routes
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await getOrder(req.params.id);
    res.json(order);
  } catch (error) {
    logger.error('Failed to get order', {
      orderId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(3000);
```

---

## Summary

**Three Pillars:**
1. **Metrics** - What is happening (numbers)
2. **Logs** - What happened (events)
3. **Traces** - How it happened (flow)

**Key Concepts:**
- Use structured logging
- Track correlation IDs
- Monitor RED/USE metrics
- Set up meaningful alerts
- Define SLOs and error budgets

**Tools:**
- Metrics: Prometheus, DataDog
- Logs: ELK Stack, Splunk
- Traces: Jaeger, Zipkin
- All-in-one: DataDog, New Relic

Observability is not optional—it's essential for operating reliable distributed systems.

**Next:** [Fault Tolerance and High Availability](./13-fault-tolerance.md)
