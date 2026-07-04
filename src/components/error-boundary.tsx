'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Terminal } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorCount: number
}

export class ErrorBoundary extends React.Component<Props, State> {
  private resetTimer: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // Log error
    console.error('🚨 ErrorBoundary caught an error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      errorCount: this.state.errorCount + 1,
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo)
    }
  }

  componentWillUnmount() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer)
    }
  }

  reportErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Example: Send to error tracking service (Sentry, LogRocket, etc.)
    try {
      const errorData = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }

      // Log to console in production-ready format
      console.error('[Production Error]', JSON.stringify(errorData))

      // You can send to your error tracking service here:
      // Sentry.captureException(error)
      // LogRocket.captureException(error)
      // etc.
    } catch (e) {
      console.error('Failed to report error:', e)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoBack = () => {
    window.history.back()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const showDetails = this.props.showDetails ?? process.env.NODE_ENV === 'development'
      const isMultipleErrors = this.state.errorCount > 1

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4 sm:p-8">
          <Card className="max-w-lg w-full shadow-lg border-destructive/20">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold">
                Something went wrong
              </CardTitle>
              <CardDescription>
                {isMultipleErrors
                  ? `Multiple errors detected (${this.state.errorCount} occurrences)`
                  : 'An unexpected error occurred while rendering this page'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Message */}
              {this.state.error && (
                <Alert variant="destructive">
                  <Bug className="h-4 w-4" />
                  <AlertTitle>Error Details</AlertTitle>
                  <AlertDescription className="mt-1 font-mono text-xs break-all">
                    {this.state.error.message || 'Unknown error'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Suggestions */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">You can try:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Refreshing the page</li>
                  <li>Going back to the previous page</li>
                  <li>Returning to the dashboard</li>
                  <li>Contacting support if the problem persists</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={this.handleGoBack}
                  variant="ghost"
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>

              {/* Technical Details (Development Only) */}
              {showDetails && this.state.error && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Terminal className="h-4 w-4" />
                      Technical Details
                    </div>

                    {/* Error Name & Message */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Error</p>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20 whitespace-pre-wrap">
                        {this.state.error.name}: {this.state.error.message}
                      </pre>
                    </div>

                    {/* Stack Trace */}
                    {this.state.error.stack && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Stack Trace</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    {/* Component Stack */}
                    {this.state.errorInfo?.componentStack && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Component Stack</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}

                    {/* Environment Info */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Environment</p>
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        <p>Mode: {process.env.NODE_ENV}</p>
                        <p>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                        <p>Time: {new Date().toISOString()}</p>
                        <p>Error Count: {this.state.errorCount}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Support Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  If the problem persists, please{' '}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact support
                  </Link>
                  {' '}and provide the error details above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper component
export function ErrorBoundaryWrapper({
  children,
  fallback,
  onError,
  showDetails,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}) {
  return (
    <ErrorBoundary fallback={fallback} onError={onError} showDetails={showDetails}>
      {children}
    </ErrorBoundary>
  )
}

// Higher-Order Component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    showDetails?: boolean
  }
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary
      fallback={options?.fallback}
      onError={options?.onError}
      showDetails={options?.showDetails}
    >
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}

// Simple inline error fallback for quick use
export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  )
}