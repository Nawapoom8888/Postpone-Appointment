// import { DefaultLandingComponent } from './landing/index.jsx'
import AppointmentCalendar from "./calendar/calendar.jsx";
function App() {
    return (
        <div className="rootDiv">
            {/* This is a default placeholder component, 
    				remove this and add your own component */}
            <AppointmentCalendar />
        </div>
    )
    // return (
    //     <div className="app-container">
    //         <header className="header">
    //             <h1>My React Project</h1>
    //             <nav>
    //                 <a href="/">Home</a>
    //                 <a href="/about">About</a>
    //                 <a href="/contact">Contact</a>
    //             </nav>
    //         </header>

    //         <main className="content">
    //             <h2>Welcome!</h2>
    //             <p>This is a sample page built with React.</p>
    //             <button onClick={() => alert("Button clicked!")}>Click Me</button>
    //         </main>

    //         <footer className="footer">
    //             <p>© {new Date().getFullYear()} My React Project</p>
    //         </footer>
    //     </div>
    // );
}

export default App
