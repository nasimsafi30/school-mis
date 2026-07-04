'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  HelpCircle, Mail, Phone, MessageSquare, Book, 
  Video, FileText, ExternalLink, ChevronRight, Search,
  Loader2, CheckCircle, X
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const faqs = [
  { q: 'How do I add a new student?', a: 'Go to Students page and click the "Add Student" button. Fill in the required information and submit.', tags: ['students', 'add', 'enroll'] },
  { q: 'How do I mark attendance?', a: 'Navigate to Attendance, select a class and section, choose the date, and mark each student as Present, Absent, or Late.', tags: ['attendance', 'mark', 'daily'] },
  { q: 'How do I process payroll?', a: 'Go to Payroll, click "Process Payroll", select an employee, fill in salary details, and submit.', tags: ['payroll', 'salary', 'payment'] },
  { q: 'How do I upload a profile photo?', a: 'Go to Settings > Profile, click the Upload button on the avatar, and select an image file.', tags: ['profile', 'photo', 'upload', 'settings'] },
  { q: 'How do I create an exam?', a: 'Navigate to Exams, click "Create Exam", select class/subject, set date/time and marks, then submit.', tags: ['exam', 'test', 'create'] },
  { q: 'How do I add a new teacher?', a: 'Go to Teachers page, click "Add Teacher", fill in personal and professional details, and submit.', tags: ['teachers', 'add', 'staff'] },
  { q: 'How do I generate reports?', a: 'Go to Reports page, select a report type, and click "Generate" to download the report.', tags: ['reports', 'export', 'download'] },
  { q: 'How do I change my password?', a: 'Go to Settings > Security, enter your current password and new password, then click "Change Password".', tags: ['password', 'security', 'settings'] },
]

const quickLinks = [
  { label: 'User Guide', icon: Book, href: '#', desc: 'Complete documentation' },
  { label: 'Video Tutorials', icon: Video, href: '#', desc: 'Watch step-by-step guides' },
  { label: 'API Documentation', icon: FileText, href: '#', desc: 'Technical reference' },
  { label: 'System Status', icon: ExternalLink, href: '#', desc: 'Check system health' },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Filter FAQs based on search
  const filteredFaqs = searchQuery.trim() === '' 
    ? faqs 
    : faqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.includes(searchQuery.toLowerCase()))
      )

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setSending(true)
    
    // Simulate sending (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSending(false)
    setSent(true)
    toast.success('Message sent successfully!')
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSent(false)
      setContactForm({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white shadow-xl shadow-green-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='relative'>
          <h1 className='text-3xl font-bold'>Help & Support</h1>
          <p className='text-green-200 mt-2'>Find answers, guides, and get assistance</p>
        </div>
      </div>

      {/* Search */}
      <Card className='border-0 shadow-md'>
        <CardContent className='p-6'>
          <div className='relative max-w-2xl mx-auto'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
            <Input 
              placeholder='Search for help articles...' 
              className='pl-12 h-12 text-lg rounded-xl'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button title='Clear search' aria-label='Clear search' 
                onClick={() => setSearchQuery('')}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <X className='h-5 w-5' />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className='text-sm text-muted-foreground mt-2 text-center'>
              Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </CardContent>
      </Card>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Quick Links */}
        <div className='lg:col-span-1 space-y-4'>
          <Card className='border-0 shadow-md'>
            <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
            <CardContent className='space-y-2'>
              {quickLinks.map((link) => (
                <Link key={link.label} href={link.href}
                  className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group'>
                  <div className='p-2 bg-green-100 dark:bg-green-900/50 rounded-lg'>
                    <link.icon className='h-5 w-5 text-green-600 dark:text-green-400' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{link.label}</p>
                    <p className='text-xs text-muted-foreground'>{link.desc}</p>
                  </div>
                  <ChevronRight className='h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors' />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className='border-0 shadow-md'>
            <CardHeader><CardTitle>Contact Us</CardTitle></CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl'>
                <div className='p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg'><Mail className='h-5 w-5 text-blue-600' /></div>
                <div><p className='text-sm font-medium'>Email Support</p><p className='text-xs text-muted-foreground'>support@school.com</p></div>
              </div>
              <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl'>
                <div className='p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg'><Phone className='h-5 w-5 text-emerald-600' /></div>
                <div><p className='text-sm font-medium'>Phone Support</p><p className='text-xs text-muted-foreground'>+1 (555) 123-4567</p></div>
              </div>
              <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl'>
                <div className='p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg'><MessageSquare className='h-5 w-5 text-purple-600' /></div>
                <div><p className='text-sm font-medium'>Live Chat</p><p className='text-xs text-muted-foreground'>Available 9AM-5PM</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ & Contact Form */}
        <div className='lg:col-span-2 space-y-6'>
          {/* FAQs */}
          <Card className='border-0 shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <HelpCircle className='h-5 w-5 text-green-500' /> Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {filteredFaqs.length === 0 ? (
                <div className='text-center py-8'>
                  <Search className='h-12 w-12 mx-auto text-gray-300 mb-4' />
                  <p className='text-lg text-muted-foreground'>No FAQs found for "{searchQuery}"</p>
                  <p className='text-sm text-muted-foreground mt-1'>Try a different search term or browse all FAQs</p>
                  <Button variant='outline' className='mt-4' onClick={() => setSearchQuery('')}>
                    Show All FAQs
                  </Button>
                </div>
              ) : (
                filteredFaqs.map((faq, i) => (
                  <details key={i} className='group border rounded-xl'>
                    <summary className='flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors'>
                      <span className='text-sm font-medium pr-4'>{faq.q}</span>
                      <ChevronRight className='h-4 w-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0' />
                    </summary>
                    <p className='px-4 pb-4 text-sm text-muted-foreground'>{faq.a}</p>
                  </details>
                ))
              )}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className='border-0 shadow-md'>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className='text-center py-8 animate-in'>
                  <CheckCircle className='h-16 w-16 mx-auto text-green-500 mb-4' />
                  <h3 className='text-xl font-bold'>Message Sent!</h3>
                  <p className='text-muted-foreground mt-2'>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label>Name *</Label>
                      <Input 
                        placeholder='Your name' 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input 
                        type='email' 
                        placeholder='Your email'
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input 
                      placeholder='What is this about?'
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Message *</Label>
                    <Textarea 
                      placeholder='Describe your issue...' 
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>
                  <Button 
                    type='submit'
                    disabled={sending}
                    className='bg-gradient-to-r from-green-600 to-emerald-600 w-full'
                  >
                    {sending ? (
                      <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Sending...</>
                    ) : (
                      <><MessageSquare className='mr-2 h-4 w-4' /> Send Message</>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
