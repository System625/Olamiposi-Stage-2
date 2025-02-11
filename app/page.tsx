import TicketSteps from '@/components/TicketSteps'
import NavBar from '@/components/NavBar'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#041E23] text-white p-4 md:p-8 font-jeju">
      <div className="max-w-6xl mx-auto">
        <NavBar />        
        <TicketSteps />
      </div>
    </main>
  )
}
