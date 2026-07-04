interface MetricData {
  type: string
  path?: string
  value: number
  tags?: Record<string, string>
  timestamp: string
}

class PerformanceMonitor {
  private metrics: MetricData[] = []
  private readonly MAX_METRICS = 1000

  trackPageLoad(path: string, loadTime: number) {
    this.addMetric({
      type: 'page_load',
      path,
      value: loadTime,
      timestamp: new Date().toISOString(),
    })

    if (loadTime > 3000) {
      console.warn(`Slow page load: ${path} - ${loadTime}ms`)
    }

    if (process.env.NODE_ENV === 'production') {
      this.reportToAnalytics('page_load', { path, loadTime })
    }
  }

  trackAPIResponse(endpoint: string, responseTime: number, status: number) {
    this.addMetric({
      type: 'api_response',
      path: endpoint,
      value: responseTime,
      tags: { status: status.toString() },
      timestamp: new Date().toISOString(),
    })

    if (responseTime > 1000) {
      console.warn(`Slow API: ${endpoint} - ${responseTime}ms (Status: ${status})`)
    }
  }

  trackDatabaseQuery(query: string, executionTime: number) {
    this.addMetric({
      type: 'db_query',
      value: executionTime,
      tags: { query: query.substring(0, 100) },
      timestamp: new Date().toISOString(),
    })

    if (executionTime > 500) {
      console.warn(`Slow query (${executionTime}ms): ${query.substring(0, 100)}`)
    }
  }

  trackError(error: Error, context?: Record<string, any>) {
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    })

    if (process.env.NODE_ENV === 'production') {
      this.reportToErrorTracking(error, context)
    }
  }

  private addMetric(metric: MetricData) {
    this.metrics.push(metric)
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }
  }

  private reportToAnalytics(type: string, data: Record<string, any>) {
    // Send to your analytics service (Vercel Analytics, Google Analytics, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', type, data)
    }
  }

  private reportToErrorTracking(error: Error, context?: Record<string, any>) {
    // Send to your error tracking service (Sentry, LogRocket, etc.)
    console.error('[Error Tracking]', {
      message: error.message,
      stack: error.stack,
      context,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    })
  }

  getMetrics(limit: number = 100): MetricData[] {
    return this.metrics.slice(-limit)
  }

  getAverageResponseTime(path?: string): number {
    const relevant = path
      ? this.metrics.filter(m => m.path === path)
      : this.metrics

    if (relevant.length === 0) return 0

    const sum = relevant.reduce((acc, m) => acc + m.value, 0)
    return sum / relevant.length
  }

  clearMetrics() {
    this.metrics = []
  }
}

export const monitor = new PerformanceMonitor()