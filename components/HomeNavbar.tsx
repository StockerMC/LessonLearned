import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router";

export default function HomeNavbar() {
    const supabaseClient = useSupabaseClient()
    const router = useRouter();
    return (
        <div className='navbar-container'>
            <button className='logout-button darken-button-hover'
                onClick={async () => {
                    await supabaseClient.auth.signOut()
                    router.push('/')
                  }}
            >Log out</button>
        </div>
    )
}