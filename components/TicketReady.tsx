'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import styles from './TicketReady.module.css'
import { Card } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import Image from 'next/image'

interface TicketData {
  type: string | null
  numberOfTickets: string
  fullName?: string
  email?: string
  profilePhoto?: string
  message?: string
}

interface TicketReadyProps {
  ticketData: TicketData
  onBookAnother: () => void
}

// Create a client-only ticket content component
const TicketContent = dynamic(() => Promise.resolve(({ ticketData }: { ticketData: TicketData }) => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`${styles.ticketContent} bg-gradient-to-br from-[#07373F] via-[#08252B] to-[#052228]`}>
      <div className="text-center space-y-3">
        <h3 className="md:text-4xl text-3xl text-white font-road-rage">Techember Fest &quot;25</h3>
        <div className="space-y-1 text-[10px] md:text-sm text-gray-200 font-roboto">
          <div className="flex items-center justify-center gap-2">
            <span role="img" aria-label="location">📍</span>
            <span>04 Rumens road, Ikoyi, Lagos</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span role="img" aria-label="calendar">📅</span>
            <span>March 15, 2025 | 7:00 PM</span>
          </div>
        </div>
      </div>

      {mounted && (
        <>
          <div className="flex justify-center">
            {ticketData.profilePhoto ? (
              <div className="relative w-36 h-36 border-4 border-[#24A0B5] rounded-lg">
                <Image
                  src={ticketData.profilePhoto}
                  alt="Attendee's profile"
                  className="rounded-lg object-cover"
                  fill
                  sizes="(max-width: 768px) 144px, 144px"
                  priority
                />
                <div className="absolute inset-0 rounded-lg ring-2 ring-[#197686]/30 ring-offset-2 ring-offset-[#0E464F]" />
              </div>
            ) : (
              <div className="w-36 h-36 rounded-lg bg-[#052228] flex items-center justify-center ring-2 ring-[#197686]/30 ring-offset-2 ring-offset-[#0E464F]">
                <span className="text-white/50">No photo</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 text-sm font-roboto border border-[#24A0B5] rounded-lg p-4">
            <div className="border-b border-r border-[#24A0B5] p-2">
              <div className="text-gray-400 text-[10px] mb-1">Name</div>
              <div className="text-white text-xs line-clamp-1">{ticketData.fullName}</div>
            </div>
            <div className="border-b border-l border-[#24A0B5] p-2">
              <div className="text-gray-400 text-[10px] mb-1">Email</div>
              <div className="text-white text-xs line-clamp-3">{ticketData.email}</div>
            </div>
            <div className="border-b border-r border-[#24A0B5] p-2">
              <div className="text-gray-400 text-[10px] mb-1">Ticket Type</div>
              <div className="text-white text-xs">{ticketData.type || 'VIP'}</div>
            </div>
            <div className="border-b border-l border-[#24A0B5] p-2">
              <div className="text-gray-400 text-[10px] mb-1">Ticket for</div>
              <div className="text-white text-xs">{ticketData.numberOfTickets || '1'}</div>
            </div>
            <div className="col-span-2 mt-2 p-2">
              <div className="text-gray-400 text-[10px] mb-2">Special request</div>
              <div className="text-white text-xs bg-[#052228] p-4 rounded-lg min-h-[80px] leading-relaxed whitespace-pre-wrap break-words">
                {ticketData.message || 'No special requests'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}), { ssr: false })

// Create a client-only barcode component
const BarcodeSection = dynamic(() => Promise.resolve(() => (
  <div className={`${styles.barcodeSection} bg-gradient-to-br from-[#07373F] via-[#08252B] to-[#052228]`}>
    <div className="relative h-12 w-32 mx-auto mb-2">
      <Image
        src="/images/barcode.png"
        alt="Ticket barcode"
        fill
        sizes="128px"
        className="object-contain"
        priority
      />
    </div>
    <div className="text-xs text-gray-400 tracking-wider">234567 891026</div>
  </div>
)), { ssr: false })

export default function TicketReady({ ticketData, onBookAnother }: TicketReadyProps) {
  const [mounted, setMounted] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDownload = async () => {
    if (ticketRef.current === null) {
      toast.error('Unable to generate ticket. Please try again.')
      return
    }

    try {
      setIsDownloading(true)
      const dataUrl = await toPng(ticketRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        width: ticketRef.current.offsetWidth,
        height: ticketRef.current.offsetHeight,
        backgroundColor: '#0E464F',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0',
          padding: '0',
        },
        filter: (node) => {          
          const exclusionClasses = ['overflow-hidden', 'overflow-x-hidden', 'overflow-y-hidden']
          return !exclusionClasses.some(className => 
            node.classList?.contains(className)
          )
        }
      })
      
      const ticketType = ticketData.type?.replace(' ACCESS', '') || 'REGULAR'
      const userName = ticketData.fullName?.replace(/\s+/g, '_') || 'attendee'
      const fileName = `${ticketType}_ticket_${userName}.png`
      
      saveAs(dataUrl, fileName)
      toast.success('Ticket downloaded successfully!')
    } catch (error) {
      console.error('Error downloading ticket:', error)
      toast.error('Failed to download ticket. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 bg-transparent border border-[#197686] rounded-3xl">
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-[#08252B] rounded w-1/3"></div>
            <div className="h-2 bg-[#08252B] rounded"></div>
            <div className="h-[400px] bg-[#08252B] rounded-3xl"></div>
            <div className="flex gap-4">
              <div className="h-12 bg-[#08252B] rounded flex-1"></div>
              <div className="h-12 bg-[#08252B] rounded flex-1"></div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto" role="main">
      <Card className="p-8 bg-transparent border border-[#197686] rounded-3xl">        
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="md:text-3xl text-lg mb-2 text-white">Ready</h2>
            <span className="text-sm relative top-[-4px] md:top-0 text-gray-200 font-roboto">Step 3/3</span>
          </div>

          <div className="w-full bg-[#07373F] h-2 rounded-full">
            <div className="bg-[#197686] h-full rounded-full w-full"></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 font-roboto">Your Ticket is Booked!</h2>
          <div className="text-gray-200 font-roboto">Check your email for a copy or you can <span className="text-white">download</span></div>
        </div>

        <div className="max-w-sm mx-auto mb-8 border border-[#24A0B5] rounded-3xl">
          <div
            ref={ticketRef}
            className={`${styles.ticket} border border-[#24A0B5]`}
            role="article"
            aria-label="Event ticket"
          >
            <TicketContent ticketData={ticketData} />
            <BarcodeSection />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onBookAnother}
            className="flex-1 text-[#24A0B5] bg-transparent border-[#24A0B5] hover:bg-[#24A0B5]/10 h-12"
          >
            Book Another Ticket
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 bg-[#24A0B5] text-white hover:bg-[#24A0B5]/90 h-12"
          >
            {isDownloading ? 'Downloading...' : 'Download Ticket'}
          </Button>
        </div>
      </Card>
    </div>
  )
} 