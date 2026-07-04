'use client'

import { Button } from '@/components/ui/button'
import { Printer, Download, FileText, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'

interface PrintableTableProps {
  children: React.ReactNode
  title?: string
  description?: string
  onPrint?: () => void
  onExportPDF?: () => void
  onExportCSV?: () => void
  showActions?: boolean
  className?: string
}

export function PrintableTable({
  children,
  title,
  description,
  onPrint,
  onExportPDF,
  onExportCSV,
  showActions = true,
  className,
}: PrintableTableProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      // Default print behavior
      window.print()
    }
  }

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF()
    } else {
      toast.info('PDF export is not configured')
    }
  }

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV()
    } else {
      toast.info('CSV export is not configured')
    }
  }

  return (
    <div className={className}>
      {/* Action Bar - Hidden during print */}
      {showActions && (
        <div className="flex items-center justify-between mb-4 no-print">
          <div>
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            {onExportPDF && (
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            )}
            {onExportCSV && (
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Printable Content */}
      <div className="print-content">
        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block print:mb-6">
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold">School MIS</h1>
            <p className="text-sm text-gray-600">Management Information System</p>
            {title && <h2 className="text-xl font-semibold mt-4">{title}</h2>}
            <p className="text-sm text-gray-500">
              Printed on: {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        {children}

        {/* Print Footer - Only visible when printing */}
        <div className="hidden print:block print:mt-6">
          <div className="border-t pt-4 mt-4 text-center text-xs text-gray-500">
            <p>This is a computer-generated document from School MIS</p>
            <p>© {new Date().getFullYear()} School MIS. All rights reserved.</p>
            <p>Printed by: Admin | Page 1 of 1</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except print content */
          body * {
            visibility: hidden;
          }
          
          .print-content,
          .print-content * {
            visibility: visible;
          }
          
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }

          /* Hide no-print elements */
          .no-print {
            display: none !important;
          }

          /* Page setup */
          @page {
            size: A4;
            margin: 1cm;
          }

          /* Table styles for print */
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          th {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
            font-weight: 600;
            text-align: left;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          td {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            color: #111827 !important;
          }

          /* Badge styles for print */
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #d1d5db;
          }

          /* Hide interactive elements */
          button,
          .dropdown-menu,
          .checkbox,
          input[type="checkbox"],
          .actions-column {
            display: none !important;
          }

          /* Links */
          a {
            color: #111827 !important;
            text-decoration: none !important;
          }

          /* Background colors */
          .bg-green-100 { background-color: #d1fae5 !important; }
          .bg-red-100 { background-color: #fee2e2 !important; }
          .bg-yellow-100 { background-color: #fef3c7 !important; }
          .bg-blue-100 { background-color: #dbeafe !important; }

          /* Text colors */
          .text-green-800 { color: #065f46 !important; }
          .text-red-800 { color: #991b1b !important; }
          .text-yellow-800 { color: #92400e !important; }
          .text-blue-800 { color: #1e40af !important; }

          /* Remove shadows and borders */
          .shadow, .shadow-sm, .shadow-md, .shadow-lg {
            box-shadow: none !important;
          }

          .rounded-md, .rounded-lg {
            border-radius: 0 !important;
          }

          /* Ensure white background */
          body {
            background: white !important;
          }

          .card, [class*="card"] {
            border: 1px solid #d1d5db !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}

// Example usage component with CSV export
export function PrintableTableWithExport({
  data,
  columns,
  filename = 'export',
}: {
  data: any[]
  columns: { key: string; label: string }[]
  filename?: string
}) {
  const handleExportCSV = () => {
    try {
      // Create CSV header
      const headers = columns.map(col => col.label).join(',')

      // Create CSV rows
      const rows = data.map(item =>
        columns.map(col => {
          const value = item[col.key]
          // Escape commas and quotes in values
          const escaped = String(value || '').replace(/"/g, '""')
          return `"${escaped}"`
        }).join(',')
      )

      // Combine header and rows
      const csv = [headers, ...rows].join('\n')

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${data.length} records to CSV`)
    } catch (error) {
      toast.error('Failed to export CSV')
    }
  }

  return (
    <PrintableTable
      title="Data Export"
      description={`${data.length} records`}
      onExportCSV={handleExportCSV}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            {columns.map(col => (
              <th key={col.key} className="p-3 text-left text-sm font-medium border">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b hover:bg-muted/30">
              {columns.map(col => (
                <td key={col.key} className="p-3 text-sm border">
                  {item[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </PrintableTable>
  )
}