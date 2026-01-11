# Next Phase Development

## Planned Features

### Database Ledger
- Persistent ledger implementation using PostgreSQL/MySQL
- Redis-based ledger for high-performance scenarios
- Distributed ledger support for multi-instance deployments

### Additional Provider Adapters
- Anthropic Claude adapter
- Google Gemini adapter (native)
- Azure OpenAI adapter
- AWS Bedrock adapter

### Enhanced Policy System
- Dynamic policy updates without service restart
- Policy versioning and rollback
- Policy templates and inheritance
- Role-based access control (RBAC)

### Advanced Budget Controls
- Soft limits with alerts before hard stops
- Budget forecasting and prediction
- Budget allocation across projects/environments
- Custom budget window definitions

### Audit Enhancements
- Database-backed receipt storage
- Receipt querying and analytics
- Compliance reporting
- Receipt verification API

### Observability
- Prometheus metrics export
- OpenTelemetry integration
- Structured logging with correlation IDs
- Dashboard for monitoring and analytics

### Security
- API key rotation support
- Rate limiting per tenant
- Request signing and verification
- Audit log encryption at rest

### Performance
- Request batching and queuing
- Caching layer for policy lookups
- Optimistic budget reservations
- Connection pooling for providers

### Developer Experience
- CLI tool for configuration
- Docker Compose setup for local development
- Migration guides and examples
- SDK for common frameworks (Express, FastAPI, etc.)
