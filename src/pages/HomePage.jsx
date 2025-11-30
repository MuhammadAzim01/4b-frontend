import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuthStatus } from '../utils/auth';

export default function HomePage() {
	const navigate = useNavigate();

	useEffect(() => {
		const { isAuthenticated, user } = getAuthStatus();

		if (isAuthenticated) {
			navigate(`/${user.role}`);
		} else {
			navigate('/login');
		}
	}, [navigate]);

  return (
	<div>
		<h1>Welcome to the Home Page</h1>
		<p>Redirecting based on authentication status...</p>
	</div>
  )
}
