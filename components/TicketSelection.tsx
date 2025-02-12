'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import dynamic from 'next/dynamic'

interface TicketType {
  type: string
  price: number | 'Free'
  remaining: number
}

interface TicketSelectionProps {
  onNext: (type: string, numberOfTickets: string) => void
  selectedTicket: string | null
  numberOfTickets: string
}

const initialTicketTypes: TicketType[] = [
  { type: 'REGULAR ACCESS', price: 'Free', remaining: 20 },
  { type: 'VIP ACCESS', price: 50, remaining: 20 },
  { type: 'VVIP ACCESS', price: 150, remaining: 20 },
]

// Create a client-only ticket selection content component
const TicketSelectionContent = dynamic(() => Promise.resolve(({ 
  ticketTypes, 
  selectedTicket, 
  setSelectedTicket,
  numberOfTickets,
  setNumberOfTickets,
  getMaxTicketsAvailable,
  handleNext 
}: { 
  ticketTypes: TicketType[]
  selectedTicket: string | null
  setSelectedTicket: (ticket: string) => void
  numberOfTickets: string
  setNumberOfTickets: (tickets: string) => void
  getMaxTicketsAvailable: () => number
  handleNext: () => void
}) => (
  <div className="space-y-8 border border-[#07373F] bg-[#08252B] rounded-3xl p-4">
    <div className="text-center p-2 space-y-2 border border-[#07373F] py-6 rounded-3xl bg-gradient-to-br from-[#07373F] via-[#08252B] to-[#052228]">
      <h3 className="md:text-7xl text-4xl font-normal text-white font-road-rage">Techember Fest &quot;25</h3>
      <div className="text-gray-200 w-full md:w-7/12 mx-auto text-sm md:text-base font-roboto pb-5 md:pb-0">
        Join us for an unforgettable experience at [Event Name]! Secure your spot now.
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm text-gray-200 font-roboto">
        <span>📍 [Event Location]</span>
        <span className='hidden md:block'>||</span>
        <span>March 15, 2025 | 7:00 PM</span>
      </div>
    </div>

    <div className="border border-[#07373F] h-1 bg-[#07373F] rounded-3xl"></div>

    <div>
      <div className="text-white mb-4 font-roboto">Select Ticket Type:</div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-4 border border-[#07373F] bg-[#052228] py-6 rounded-3xl">
        {ticketTypes.map((ticket) => (
          ticket.remaining > 0 ? (
            <button
              key={ticket.type}
              onClick={() => setSelectedTicket(ticket.type)}
              className={`p-2 w-full mx-auto rounded-xl border ${
                selectedTicket === ticket.type
                  ? 'border-[#12464E] bg-[#12464E]'
                  : 'border-[#197686] bg-[#052228]'
              } text-left`}
            >
              <div className="flex flex-col-reverse gap-2 justify-start items-start">
                <span className='font-roboto text-white'>{ticket.type}</span>
                <span className="w-1/3 font-semibold text-xl font-roboto text-white">
                  {ticket.price === 'Free' ? 'Free' : `$${ticket.price}`}
                </span>
              </div>
              <div className="text-gray-200 text-sm font-roboto">{ticket.remaining} left!</div>
            </button>
          ) : (
            <div
              key={ticket.type}
              className="p-2 w-full mx-auto rounded-xl border border-[#07373F] bg-[#052228]/50 text-left opacity-50"
            >
              <div className="flex justify-between items-start">
                <span className='font-roboto text-white'>{ticket.type}</span>
                <span className="w-1/3 p-1 flex font-semibold justify-end rounded-md border text-xl font-roboto bg-[#0E464F] text-white border-[#197686]">
                  {ticket.price === 'Free' ? 'Free' : `$${ticket.price}`}
                </span>
              </div>
              <div className="text-red-400 text-sm font-roboto">Sold Out!</div>
            </div>
          )
        ))}
      </div>
    </div>

    <div>
      <div className="text-white mb-4 font-roboto">Number of Tickets</div>
      <Select value={numberOfTickets} onValueChange={setNumberOfTickets}>
        <SelectTrigger className="bg-transparent border-[#07373F] text-white font-roboto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: getMaxTicketsAvailable() }, (_, i) => i + 1).map((num) => (
            <SelectItem key={num} value={num.toString()} className="font-roboto text-white">
              {num}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="flex flex-col-reverse md:px-10 md:flex-row justify-between gap-4 mt-4 rounded-3xl">
      <Button
        type="button"
        variant="outline"
        className="flex-1 text-[#24A0B5] bg-transparent min-h-11 border-[#24A0B5] hover:bg-[#24A0B5]/10"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleNext}
        disabled={!selectedTicket}
        className="flex-1 min-h-11 bg-[#24A0B5] text-white hover:bg-[#24A0B5]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </Button>
    </div>
  </div>
)), { ssr: false })

export default function TicketSelection({ onNext, selectedTicket: initialSelectedTicket, numberOfTickets: initialNumberOfTickets }: TicketSelectionProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [numberOfTickets, setNumberOfTickets] = useState('1')
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(initialTicketTypes)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setSelectedTicket(initialSelectedTicket)
      setNumberOfTickets(initialNumberOfTickets)
      
      const savedInventory = localStorage.getItem('ticketInventory')
      if (savedInventory) {
        setTicketTypes(JSON.parse(savedInventory))
      }
    }
  }, [mounted, initialSelectedTicket, initialNumberOfTickets])
  
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('ticketInventory', JSON.stringify(ticketTypes))
    }
  }, [ticketTypes, mounted])

  const handleNext = () => {
    if (selectedTicket && numberOfTickets) {
      setTicketTypes(prevTypes => {
        return prevTypes.map(ticket => {
          if (ticket.type === selectedTicket) {
            return {
              ...ticket,
              remaining: ticket.remaining - parseInt(numberOfTickets)
            }
          }
          return ticket
        })
      })
      onNext(selectedTicket, numberOfTickets)
    }
  }

  const getMaxTicketsAvailable = () => {
    if (!selectedTicket) return 5
    const selectedType = ticketTypes.find(t => t.type === selectedTicket)
    return Math.min(5, selectedType?.remaining || 0)
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
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 bg-transparent border border-[#197686] rounded-3xl">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="md:text-3xl text-lg mb-2 text-white">Ticket Selection</h2>
            <span className="text-sm relative top-[-4px] md:top-0 text-gray-200 font-roboto">Step 1/3</span>
          </div>

          <div className="w-full bg-[#07373F] h-2 rounded-full">
            <div className="bg-[#197686] h-full rounded-full w-[33%]"></div>
          </div>
        </div>

        <TicketSelectionContent 
          ticketTypes={ticketTypes}
          selectedTicket={selectedTicket}
          setSelectedTicket={setSelectedTicket}
          numberOfTickets={numberOfTickets}
          setNumberOfTickets={setNumberOfTickets}
          getMaxTicketsAvailable={getMaxTicketsAvailable}
          handleNext={handleNext}
        />
      </Card>
    </div>
  )
} 