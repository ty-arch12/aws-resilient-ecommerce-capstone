# Disaster Recovery Runbook: Active-Passive Multi-Region Failover

## 1. Business Resilience Metrics (RTO / RPO)
* **Target Recovery Time Objective (RTO)**: < 15 Minutes
* **Target Recovery Point Objective (RPO)**: < 5 Minutes

---

## 2. Pre-Failover Verification Actions
Before initiating a failover, confirm a total primary region (`us-east-1`) outage by checking:
1. CloudWatch Synthetics canary alarms for frontend availability.
2. Route 53 Health Check status panels tracking the primary Application Load Balancer.

---

## 3. Step-by-Step Regional Failover Execution

### Step 3.1: Promote the Secondary Database Cluster
Execute this AWS CLI command to promote your secondary Amazon Aurora Global Database replica in `us-west-2` to become the standalone primary writer:
```bash
aws rds failover-global-cluster \
    --global-cluster-identifier ecommerce-global-db \
    --target-db-cluster-identifier arn:aws:rds:us-west-2:123456789012:cluster:ecommerce-dr-db-cluster
```

### Step 3.2: Update Global DNS Traffic Routing
If Route 53 does not automatically fail over based on target health checks, execute a manual DNS record shift using a change batch file:
```bash
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890XYZ \
    --change-batch file://dr-dns-shift.json
```

---

## 4. Post-Failover Integrity Verification
1. Run a curl response probe against your primary production domain: `curl -I https://production-company.com`
2. Confirm the returned HTTP status is a clean `200 OK`.
3. Inspect the `us-west-2` CloudWatch container logs to verify web tasks are writing to the newly promoted database local cluster.
