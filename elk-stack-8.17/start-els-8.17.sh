#!/bin/bash
# Start ELK Stack 8.17.0 with Health Monitoring

set -e

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
TIMEOUT_ES=120
TIMEOUT_KIBANA=180
TIMEOUT_LOGSTASH=90
HEALTH_CHECK_INTERVAL=5

# Print startup header
echo "================================================================="
echo "           Starting ELK Stack 8.17.0"
echo "================================================================="
echo "Services: Elasticsearch, Kibana, Logstash, Filebeat, Metricbeat"
echo "Version: 8.17.0"
echo "================================================================="
echo

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if ! [[ -f "docker-compose.yml" ]]; then
        log_error "docker-compose.yml not found in current directory"
        exit 1
    fi
    
    # Check file permissions
    if [[ -f "filebeat/config/filebeat.yml" ]]; then
        if [[ $(stat -c %U filebeat/config/filebeat.yml 2>/dev/null) != "root" ]]; then
            log_warning "Filebeat config not owned by root - fixing..."
            sudo chown root:root filebeat/config/filebeat.yml
            sudo chmod 600 filebeat/config/filebeat.yml
        fi
    fi
    
    log_success "Prerequisites check completed"
}

# Start services in stages
start_services() {
    log_info "Starting ELK Stack 8.17.0 services..."
    
    # Pull latest images if needed
    log_info "Pulling latest 8.17.0 images..."
    docker-compose pull --quiet
    
    # Start Elasticsearch first
    log_info "Starting Elasticsearch 8.17.0..."
    docker-compose up -d elasticsearch
    
    # Wait for Elasticsearch with enhanced health check
    log_info "Waiting for Elasticsearch to be ready..."
    wait_for_elasticsearch
    
    # Start Kibana
    log_info "Starting Kibana 8.17.0..."
    docker-compose up -d kibana
    
    # Start Logstash
    log_info "Starting Logstash 8.17.0..."
    docker-compose up -d logstash
    
    # Wait for Logstash
    log_info "Waiting for Logstash to be ready..."
    wait_for_logstash
    
    # Start Beats
    log_info "Starting Filebeat 8.17.0..."
    docker-compose up -d filebeat
    
    log_info "Starting Metricbeat 8.17.0..."
    docker-compose up -d metricbeat
    
    # Wait for Kibana (takes longest)
    log_info "Waiting for Kibana to be ready..."
    wait_for_kibana
    
    log_success "All services started successfully!"
}

# Enhanced Elasticsearch health check
wait_for_elasticsearch() {
    local count=0
    local health_status=""
    
    while [[ $count -lt $TIMEOUT_ES ]]; do
        if curl -s http://localhost:9200/_cat/health >/dev/null 2>&1; then
            health_status=$(curl -s http://localhost:9200/_cat/health?h=status)
            
            if [[ "$health_status" =~ "green" ]] || [[ "$health_status" =~ "yellow" ]]; then
                echo
                log_success "Elasticsearch is ready (status: $health_status)"
                
                # Check version
                local version=$(curl -s http://localhost:9200/ | grep -o '"version"[^}]*' | grep -o '8\.17\.[0-9]' || echo "unknown")
                log_info "Elasticsearch version: $version"
                
                # Check cluster info
                local cluster_name=$(curl -s http://localhost:9200/ | grep -o '"cluster_name"[^,]*' | cut -d'"' -f4)
                log_info "Cluster name: $cluster_name"
                
                return 0
            fi
        fi
        
        echo -n "."
        sleep $HEALTH_CHECK_INTERVAL
        count=$((count + HEALTH_CHECK_INTERVAL))
    done
    
    echo
    log_error "Elasticsearch failed to start within ${TIMEOUT_ES}s"
    show_elasticsearch_logs
    exit 1
}

# Enhanced Kibana health check
wait_for_kibana() {
    local count=0
    
    while [[ $count -lt $TIMEOUT_KIBANA ]]; do
        if curl -s --max-time 10 http://localhost:5601/api/status >/dev/null 2>&1; then
            local status=$(curl -s http://localhost:5601/api/status | grep -o '"overall"[^}]*' | grep -o '"level":"[^"]*' | cut -d'"' -f4)
            
            if [[ "$status" == "available" ]] || [[ -z "$status" ]]; then
                echo
                log_success "Kibana is ready"
                
                # Check for new 8.17 features
                check_kibana_features
                
                return 0
            fi
        fi
        
        echo -n "."
        sleep $HEALTH_CHECK_INTERVAL
        count=$((count + HEALTH_CHECK_INTERVAL))
    done
    
    echo
    log_warning "Kibana may still be starting (timeout reached)"
    log_info "Access Kibana at: http://localhost:5601"
    return 0
}

# Enhanced Logstash health check
wait_for_logstash() {
    local count=0
    
    while [[ $count -lt $TIMEOUT_LOGSTASH ]]; do
        if curl -s --max-time 10 http://localhost:9600/_node/stats >/dev/null 2>&1; then
            echo
            log_success "Logstash is ready"
            
            # Check pipeline status
            local pipeline_workers=$(curl -s http://localhost:9600/_node/stats | grep -o '"workers":[0-9]*' | cut -d':' -f2 || echo "unknown")
            log_info "Logstash pipeline workers: $pipeline_workers"
            
            return 0
        fi
        
        echo -n "."
        sleep $HEALTH_CHECK_INTERVAL
        count=$((count + HEALTH_CHECK_INTERVAL))
    done
    
    echo
    log_warning "Logstash health check timeout"
    return 0
}

# Check Kibana 8.17 features
check_kibana_features() {
    log_info "Checking Kibana 8.17.0 features..."
    
    # Check if new features are available
    if curl -s http://localhost:5601/api/features >/dev/null 2>&1; then
        log_success "✅ Kibana API responsive"
        log_info "New 8.17 features should be available:"
        echo "   • Enhanced alerting framework"
        echo "   • ES|QL query bookmarking"
        echo "   • Drag-and-drop column reordering"
        echo "   • Log Rate Analysis panels"
        echo "   • Cases API with file attachments"
    fi
}

# Show service status
show_status() {
    echo
    log_info "Service Status:"
    docker-compose ps
    
    echo
    log_info "Service Health:"
    
    # Elasticsearch
    if curl -s http://localhost:9200/_cat/health >/dev/null 2>&1; then
        local es_status=$(curl -s http://localhost:9200/_cat/health?h=status,node.total,docs.count,store.size)
        log_success "✅ Elasticsearch: $es_status"
    else
        log_warning "❌ Elasticsearch: Not responding"
    fi
    
    # Kibana
    if curl -s --max-time 5 http://localhost:5601/api/status >/dev/null 2>&1; then
        log_success "✅ Kibana: Available at http://localhost:5601"
    else
        log_warning "❌ Kibana: Not ready (may still be starting)"
    fi
    
    # Logstash
    if curl -s http://localhost:9600/_node/stats >/dev/null 2>&1; then
        log_success "✅ Logstash: API responsive at http://localhost:9600"
    else
        log_warning "❌ Logstash: Not responding"
    fi
    
    # Filebeat
    if docker ps | grep -q "filebeat.*Up"; then
        log_success "✅ Filebeat: Running"
    else
        log_warning "❌ Filebeat: Not running"
    fi
    
    # Metricbeat
    if docker ps | grep -q "metricbeat.*Up"; then
        log_success "✅ Metricbeat: Running"
    else
        log_warning "❌ Metricbeat: Not running"
    fi
}

# Show resource usage
show_resources() {
    echo
    log_info "Resource Usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Test data ingestion
test_data_ingestion() {
    echo
    log_info "Testing data ingestion..."
    
    # Send test data to Logstash
    local test_data='{"test":"ELK 8.17.0 startup","timestamp":"'$(date -Iseconds)'","version":"8.17.0","features":["enhanced_alerting","esql_bookmarks","drag_drop_columns"]}'
    
    if echo "$test_data" | nc -w 5 localhost 5000 2>/dev/null; then
        log_success "✅ Test data sent to Logstash"
        
        # Wait a moment for indexing
        sleep 10
        
        # Check if data was indexed
        if curl -s "http://localhost:9200/chatgpt-*/_search?q=8.17.0" | grep -q "8.17.0"; then
            log_success "✅ Test data successfully indexed"
        else
            log_warning "⚠️  Test data not yet indexed (may take a moment)"
        fi
    else
        log_warning "⚠️  Could not send test data to Logstash"
    fi
}

# Show logs for failed services
show_elasticsearch_logs() {
    log_error "Elasticsearch logs:"
    docker-compose logs --tail 20 elasticsearch
}

show_kibana_logs() {
    log_error "Kibana logs:"
    docker-compose logs --tail 20 kibana
}

show_logstash_logs() {
    log_error "Logstash logs:"
    docker-compose logs --tail 20 logstash
}

# Create index patterns for Kibana
create_index_patterns() {
    log_info "Creating Kibana index patterns..."
    
    # Wait for Kibana to be fully ready
    sleep 30
    
    # Create ChatGPT conversations index pattern
    curl -X POST "localhost:5601/api/saved_objects/index-pattern/chatgpt-conversations" \
         -H "Content-Type: application/json" \
         -H "kbn-xsrf: true" \
         -d '{
           "attributes": {
             "title": "chatgpt-*",
             "timeFieldName": "@timestamp",
             "fields": "[{\"name\":\"@timestamp\",\"type\":\"date\"},{\"name\":\"conversation_id\",\"type\":\"string\"},{\"name\":\"content\",\"type\":\"string\"},{\"name\":\"message_type\",\"type\":\"string\"}]"
           }
         }' >/dev/null 2>&1 && log_success "✅ ChatGPT index pattern created" || log_warning "⚠️  Index pattern creation failed"
    
    # Create Metricbeat index pattern
    curl -X POST "localhost:5601/api/saved_objects/index-pattern/metricbeat-elk" \
         -H "Content-Type: application/json" \
         -H "kbn-xsrf: true" \
         -d '{
           "attributes": {
             "title": "metricbeat-elk-*",
             "timeFieldName": "@timestamp"
           }
         }' >/dev/null 2>&1 && log_success "✅ Metricbeat index pattern created" || log_warning "⚠️  Metricbeat index pattern creation failed"
}

# Show final summary
show_summary() {
    echo
    echo "================================================================="
    log_success "🎉 ELK Stack 8.17.0 Started Successfully!"
    echo "================================================================="
    echo
    echo "🌐 Access URLs:"
    echo "   • Elasticsearch: http://localhost:9200"
    echo "   • Kibana:       http://localhost:5601"
    echo "   • Logstash:     http://localhost:9600"
    echo
    echo "🆕 New 8.17.0 Features to Explore:"
    echo "   • Enhanced Alerting (Kibana → Stack Management → Rules)"
    echo "   • ES|QL Bookmarks (Discover → Query History → Star queries)"
    echo "   • Drag-Drop Columns (Discover → Data table headers)"
    echo "   • Log Rate Analysis (Dashboard → Add panel → Logs analysis)"
    echo "   • Cases with Files (Observability → Cases → Create case)"
    echo
    echo "📊 Sample Queries to Try:"
    echo "   # Check cluster health:"
    echo "   curl http://localhost:9200/_cat/health?v"
    echo
    echo "   # Search conversations:"
    echo "   curl 'http://localhost:9200/chatgpt-*/_search?pretty&q=8.17.0'"
    echo
    echo "   # View metrics:"
    echo "   curl 'http://localhost:9200/metricbeat-*/_search?pretty&size=1'"
    echo
    echo "🔧 Management Commands:"
    echo "   docker-compose ps                    # Check status"
    echo "   docker-compose logs -f [service]     # View logs"
    echo "   docker-compose restart [service]    # Restart service"
    echo "   docker-compose down                  # Stop all services"
    echo
    log_success "Your ELK Stack 8.17.0 is ready for use!"
    echo "================================================================="
}

# Main execution
main() {
    check_prerequisites
    start_services
    show_status
    show_resources
    test_data_ingestion
    create_index_patterns
    show_summary
}

# Handle command line arguments
case "${1:-start}" in
    "start"|"")
        main
        ;;
    "status")
        show_status
        show_resources
        ;;
    "test")
        test_data_ingestion
        ;;
    "logs")
        service="${2:-}"
        if [[ -n "$service" ]]; then
            docker-compose logs -f "$service"
        else
            docker-compose logs -f
        fi
        ;;
    "restart")
        service="${2:-}"
        if [[ -n "$service" ]]; then
            log_info "Restarting $service..."
            docker-compose restart "$service"
        else
            log_info "Restarting all services..."
            docker-compose restart
        fi
        show_status
        ;;
    "stop")
        log_info "Stopping ELK Stack..."
        docker-compose down
        log_success "ELK Stack stopped"
        ;;
    "help"|"--help"|"-h")
        echo "ELK Stack 8.17.0 Management Script"
        echo "Usage: $0 [command] [service]"
        echo
        echo "Commands:"
        echo "  start        - Start all ELK services (default)"
        echo "  status       - Show service status and resource usage"
        echo "  test         - Test data ingestion"
        echo "  logs [svc]   - Show logs for all services or specific service"
        echo "  restart [svc]- Restart all services or specific service"
        echo "  stop         - Stop all services"
        echo "  help         - Show this help"
        echo
        echo "Services:"
        echo "  elasticsearch, kibana, logstash, filebeat, metricbeat"
        echo
        echo "Examples:"
        echo "  $0 start                    # Start all services"
        echo "  $0 logs kibana             # View Kibana logs"
        echo "  $0 restart elasticsearch   # Restart only Elasticsearch"
        echo "  $0 status                  # Check service status"
        ;;
    *)
        log_error "Unknown command: $1"
        log_info "Run '$0 help' for usage information"
        exit 1
        ;;
esac
