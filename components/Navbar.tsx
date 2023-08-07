import { useSupabaseClient } from "@supabase/auth-helpers-react"

export default function Navbar() {
    const supabaseClient = useSupabaseClient()
    return (
        <div className='navbar-container'>
             <button className='logout-button darken-button-hover' onClick={() => supabaseClient.auth.signOut()}>Log out</button>
        </div>
    )
}