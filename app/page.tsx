import { redirect } from 'next/navigation'
// Root redirects to customer dashboard
// Admin panel: /admin
export default function Home() { redirect('/customer') }

