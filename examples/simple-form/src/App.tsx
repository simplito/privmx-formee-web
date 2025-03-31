import { FormEventHandler, useState } from 'react';
import './App.css';
import { submitForm } from './inbox';

function App() {
    const [status, setStatus] = useState<'default' | 'loading' | 'error' | 'success'>('default');

    const handleOnSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const entries = Array.from(formData.entries());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formEntries: Record<string, any> = {};

        entries.forEach(([key, val]) => {
            const value = val.toString();
            if (formEntries[key]) {
                if (Array.isArray(formEntries[key])) {
                    formEntries[key].push(value);
                } else {
                    formEntries[key] = [formEntries[key], value];
                }
            } else {
                formEntries[key] = value;
            }
        });

        /**
         * Check README.md for more info.
         */
        try {
            setStatus('loading');
            await submitForm({
                inboxID: import.meta.env.VITE_INBOX_ID as string,
                solutionID: import.meta.env.VITE_SOLUTION_ID as string,
                platformUrl: import.meta.env.VITE_PLATFORM_URL as string,
                form: {
                    'Your name': {
                        type: 'text',
                        answered: formEntries.name
                    },
                    Email: {
                        type: 'text',
                        answered: formEntries.email
                    },
                    'What is your reason for contacting us?': {
                        type: 'single',
                        answers: [
                            'General Inquiry',
                            'Product Support',
                            'Partnership Opportunity',
                            'Other'
                        ],
                        answered: formEntries.reason
                    },
                    'What services are you interested in?': {
                        type: 'multiple',
                        answers: [
                            'Web Development',
                            'Mobile App Development',
                            'UI/UX Design',
                            'Digital Marketing',
                            'Consulting Services'
                        ],
                        answered: formEntries.services
                    },
                    'Please provide additional details about your inquiry': {
                        type: 'text',
                        answered: formEntries.details
                    }
                }
            });
            setStatus('success');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <>
            <div className="container">
                <h1>Formee Response</h1>
            </div>

            <form className="container w-full" onSubmit={handleOnSubmit}>
                <fieldset className="w-full">
                    <legend>Personal info</legend>
                    <div className="input_wrapper">
                        <label htmlFor="name">Name</label>
                        <input name="name" type="text" id="name" className="w-full" />
                    </div>
                    <div className="input_wrapper">
                        <label htmlFor="name">Email</label>
                        <input name="email" type="text" id="email" className="w-full" />
                    </div>
                </fieldset>
                <fieldset className="w-full">
                    <legend>Personal info</legend>
                    <div>
                        <p className="pb-2">What is your reason for contacting us?</p>
                        <div className="group">
                            <input
                                type="radio"
                                id="inquiry"
                                name="reason"
                                value="General Inquiry"
                            />
                            <label htmlFor="inquiry" className="group">
                                General Inquiry
                            </label>
                        </div>
                        <div className="group">
                            <input
                                type="radio"
                                id="Support"
                                name="reason"
                                value="Product Support"
                            />
                            <label htmlFor="Support" className="group">
                                Product Support
                            </label>
                        </div>
                        <div className="group">
                            <input
                                type="radio"
                                id="Opportunity"
                                name="reason"
                                value="Partnership Opportunity"
                            />
                            <label htmlFor="Opportunity" className="group">
                                Partnership Opportunity
                            </label>
                        </div>
                        <div className="group">
                            <input type="radio" id="other" name="reason" value="Other" />
                            <label htmlFor="other" className="group">
                                Other
                            </label>
                        </div>
                    </div>
                    <div>
                        <p className="pb-2">What services are you interested in?</p>
                        <div className="group">
                            <input
                                type="checkbox"
                                id="Web"
                                name="services"
                                value="Web Development"
                            />
                            <label htmlFor="Web" className="group">
                                Web Development
                            </label>
                        </div>
                        <div className="group">
                            <input
                                type="checkbox"
                                id="Mobile"
                                name="services"
                                value="Mobile App Development"
                            />
                            <label htmlFor="Mobile" className="group">
                                Mobile App Development
                            </label>
                        </div>
                        <div className="group">
                            <input
                                type="checkbox"
                                id="Design"
                                name="services"
                                value="Digital Marketing"
                            />
                            <label htmlFor="Design" className="group">
                                UI/UX Design
                            </label>
                        </div>
                        <div className="group">
                            <input
                                type="checkbox"
                                id="Consulting"
                                name="services"
                                value="Consulting Services"
                            />
                            <label htmlFor="Consulting" className="group">
                                Consulting Services
                            </label>
                        </div>
                    </div>
                    <div className="input_wrapper">
                        <label htmlFor="details">
                            Please provide additional details about your inquiry
                        </label>
                        <textarea name="details" id="details" className="w-full" rows={4} />
                    </div>
                </fieldset>
                <div className="alert-container">
                    <button disabled={status === 'loading'}>Submit Answer</button>
                    {status === 'success' && (
                        <div className="alert success">Your anwser was sent successfully.</div>
                    )}

                    {status === 'error' && (
                        <div className="alert error">
                            Error! Something went wrong. Please try again.
                        </div>
                    )}
                </div>
            </form>
        </>
    );
}

export default App;
