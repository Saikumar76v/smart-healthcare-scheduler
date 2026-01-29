const verify = async () => {
    try {
        console.log('1. Attempting Admin Login...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login Successful. Token received.');

        console.log('2. Attempting to fetch Users (Admin Route)...');
        const usersRes = await fetch('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!usersRes.ok) throw new Error(`Fetch Users failed: ${usersRes.statusText}`);

        const users = await usersRes.json();
        console.log(`Success! Fetched ${users.length} users.`);

        const adminUser = users.find(u => u.email === 'admin@example.com');
        if (adminUser && adminUser.role === 'admin') {
            console.log('Verified: Admin user exists and has correct role.');
        } else {
            console.error('Failed: Admin user not found or incorrect role.');
        }

    } catch (error) {
        console.error('Verification Failed:', error.message);
    }
};

verify();
