import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

import { validateField, hasNoFieldErrors } from '../utils/validations';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchApi } from '../utils/fetchApis';

export default function Login() {
    const navigate = useNavigate();
    const [loginDetails, setLoginDetails] = useState({
        username: "",
        password: ""
    });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [inputErrors, setInputErrors] = useState({});

    const { mutate: login, isSuccess, isError, data, error } = useCreateUpdateMutation({
        url: 'auth/login/',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        fetchFunction: fetchApi,
        onSuccessMessage: 'Logged in successfully.',
        onErrorMessage: 'Login failed'
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setLoginDetails(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleBlur = (e) => {
        const { id, value } = e.target;
        const errors = validateField(id, value, inputErrors);
        setInputErrors(errors);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const { username, password } = loginDetails;

        if (hasNoFieldErrors(inputErrors)) {
            login(JSON.stringify({username, password}));
        }
    };

    useEffect(() => {
        if (isSuccess) {
            const { access, refresh, role } = data.data;
            const user = {
                access_token: access,
                refresh_token: refresh,
                role: role,
                username: loginDetails.username
            };
            localStorage.setItem('user', JSON.stringify(user));
            navigate(`/${role}`);
        }

        if (isError && error.status === 400 && error.message === "Account is not verified.") {
            navigate('/verify-email');
        }

    }, [isSuccess, isError, data, navigate]);

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <div className="grid gap-2 text-center mb-6">
                <Link to={'/'} className="mx-auto">
                    <div className="text-3xl font-bold text-blue-600 mb-4">4B</div>
                </Link>
                <h1 className="text-2xl font-bold">Login</h1>
                <p className="text-gray-500 text-sm">Enter your credentials to access your account</p>
            </div>
            <form className="grid gap-4" onSubmit={handleLogin}>
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginDetails.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={inputErrors.username ? 'border-red-500' : ''}
                        required
                    />
                    {inputErrors.username && (
                        <div aria-live="assertive" className="flex items-center text-red-500 text-sm">
                            <span className="mr-1">⚠</span> {inputErrors.username}
                        </div>
                    )}
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={passwordVisible ? "text" : "password"}
                            placeholder="********"
                            value={loginDetails.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={inputErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            aria-label={passwordVisible ? "Hide password" : "Show password"}
                        >
                            {passwordVisible ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {inputErrors.password && (
                        <div aria-live="assertive" className="flex items-center text-red-500 text-sm">
                            <span className="mr-1">⚠</span> {inputErrors.password}
                        </div>
                    )}
                </div>
                <Button type="submit" className="w-full mt-2">Login</Button>
            </form>
        </div>
    );
}
