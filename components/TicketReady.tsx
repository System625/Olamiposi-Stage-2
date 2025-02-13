'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
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

function TicketContent({ ticketData }: { ticketData: TicketData }) {
  return (
    <div className="relative max-w-sm mx-auto px-4">
      <Image
        src="/bg.svg"
        alt="Ticket background"
        fill
        className="absolute inset-0 object-contain z-0"
        priority
      />
      <div className="relative z-10 pt-4 px-6 max-w-xs mx-auto pb-10">
        <div className="border border-[#24A0B5] rounded-2xl p-2">
          <div className="text-center space-y-2">
            <h3 className="text-2xl md:text-4xl text-white font-road-rage">Techember Fest &quot;25</h3>
            <div className="space-y-0.5 text-[8px] md:text-sm text-gray-200 font-roboto">
              <div className="flex items-center justify-center gap-1">
                <span role="img" aria-label="location">📍</span>
                <span>04 Rumens road, Ikoyi, Lagos</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span role="img" aria-label="calendar">📅</span>
                <span>March 15, 2025 | 7:00 PM</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            {ticketData.profilePhoto ? (
              <div className="relative w-24 h-24 md:w-36 md:h-36 border-4 border-[#24A0B5] rounded-lg overflow-hidden">
                <Image
                  src={ticketData.profilePhoto}
                  alt="Attendee's profile"
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 144px"
                  priority
                />
              </div>
            ) : (
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-lg bg-[#07373F] flex items-center justify-center border-4 border-[#24A0B5]">
                <span className="text-white/50 text-xs">No photo</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 text-sm font-roboto mt-2 bg-[#07373F]/50 rounded-lg">
            <div className="p-1.5 border-b border-r border-[#24A0B5]/30">
              <div className="text-gray-400 text-[8px] mb-0.5">Name</div>
              <div className="text-white text-[10px] line-clamp-1">{ticketData.fullName}</div>
            </div>
            <div className="p-1.5 border-b border-l border-[#24A0B5]/30">
              <div className="text-gray-400 text-[8px] mb-0.5">Email</div>
              <div className="text-white text-[10px] line-clamp-3">{ticketData.email}</div>
            </div>
            <div className="p-1.5 border-b border-r border-[#24A0B5]/30">
              <div className="text-gray-400 text-[8px] mb-0.5">Ticket Type</div>
              <div className="text-white text-[10px]">{ticketData.type || 'VIP'}</div>
            </div>
            <div className="p-1.5 border-b border-l border-[#24A0B5]/30">
              <div className="text-gray-400 text-[8px] mb-0.5">Ticket for</div>
              <div className="text-white text-[10px]">{ticketData.numberOfTickets || '1'}</div>
            </div>
            <div className="col-span-2 p-1.5">
              <div className="text-gray-400 text-[8px] mb-1">Special request?</div>
              <div className="text-white text-[10px] bg-[#07373F] p-2 rounded-lg min-h-[60px] leading-relaxed whitespace-pre-wrap break-words">
                {ticketData.message || 'Nil ? Or the users sad story they write in there gets this whole space, Max of three rows'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="relative h-8 w-24 mx-auto mb-1">
            <Image
              src="/images/barcode.png"
              alt="Ticket barcode"
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="object-contain"
              priority
            />
          </div>
          <div className="text-[10px] text-gray-400 tracking-wider">234567 891026</div>
        </div>
      </div>
    </div>
  )
}

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
        pixelRatio: 3,
        width: 320,
        height: ticketRef.current.offsetHeight,
        backgroundColor: '#0E464F',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'center center',
          margin: '0 auto',
          padding: '0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        },
        filter: (node) => {          
          const exclusionClasses: string[] = []
          return !exclusionClasses.some(className => 
            node.classList?.contains(className)
          )
        },
        skipAutoScale: true,
        cacheBust: true,
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

        <div className="max-w-sm mx-auto mb-8">
          <div
            ref={ticketRef}          
            role="article"
            aria-label="Event ticket"
          >
            <TicketContent ticketData={ticketData} />            
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-md mx-auto">
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