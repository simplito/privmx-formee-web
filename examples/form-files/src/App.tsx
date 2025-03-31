import { FormEventHandler, useState } from 'react';
import './App.css';
import { submitForm } from './inbox';

function App() {
    const [status, setStatus] = useState<'default' | 'loading' | 'error' | 'success'>('default');

    const handleOnSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const entries = Array.from(formData.entries());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formEntries: Record<string, any> = {};

        entries.forEach(([key, val]) => {
            const value = val;
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
        setStatus('loading');
        try {
            await submitForm({
                inboxID: import.meta.env.VITE_INBOX_ID as string,
                solutionID: import.meta.env.VITE_SOLUTION_ID as string,
                platformUrl: import.meta.env.VITE_PLATFORM_URL as string,
                form: {
                    'Your name': {
                        type: 'text',
                        answered: formEntries.name
                    },
                    'Additional Files': {
                        type: 'file',
                        answered: [formEntries.file]
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
                </fieldset>
                <fieldset className="w-full">
                    <legend>Personal info</legend>{' '}
                    <div className="input_wrapper">
                        <label htmlFor="file">Additional files</label>
                        <input name="file" type="file" id="file" className="w-full" />
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
