// frontend/src/pages/Register.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

interface RegisterFormData {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: string;
}

const Register: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        role: 'User'
    });

    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // «· Õﬁﬁ „‰ ’Õ… «·»Ì«‰« 
        if (formData.password !== formData.confirmPassword) {
            setError('ﬂ·„… «·„—Ê— €Ì— „ ÿ«»ﬁ…');
            return;
        }

        if (formData.password.length < 6) {
            setError('ﬂ·„… «·„—Ê— ÌÃ» √‰  ﬂÊ‰ 6 √Õ—› ⁄·Ï «·√ﬁ·');
            return;
        }

        if (!formData.username || !formData.password || !formData.fullName) {
            setError('Ì—ÃÏ „·¡ Ã„Ì⁄ «·ÕﬁÊ· «·„ÿ·Ê»…');
            return;
        }

        setLoading(true);
        try {
            await register({
                username: formData.username,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                email: formData.email,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber
            });
            setSuccess(' „ ≈‰‘«¡ «·Õ”«» »‰Ã«Õ! Ã«—Ì «· ÕÊÌ·...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || '›‘· ≈‰‘«¡ «·Õ”«»');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>≈‰‘«¡ Õ”«» ÃœÌœ</h1>
                    <p>”Ã· »Ì«‰« ﬂ ··«‰÷„«„ ≈·Ï ‰Ÿ«„ ISP</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fullName">«·«”„ «·ﬂ«„· *</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="√œŒ· «·«”„ «·ﬂ«„·"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">«”„ «·„” Œœ„ *</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="√œŒ· «”„ «·„” Œœ„"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">«·»—Ìœ «·≈·ﬂ —Ê‰Ì</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">—ﬁ„ «·Â« ›</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="05XXXXXXXX"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">ﬂ·„… «·„—Ê— *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="********"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                            <small className="hint">ÌÃ» √‰  ﬂÊ‰ 6 √Õ—› ⁄·Ï «·√ﬁ·</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword"> √ﬂÌœ ﬂ·„… «·„—Ê— *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="********"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">‰Ê⁄ «·Õ”«»</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="User">„” Œœ„</option>
                            <option value="Manager">„œÌ—</option>
                            <option value="Admin">„”ƒÊ·</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? 'Ã«—Ì «·≈‰‘«¡...' : '≈‰‘«¡ Õ”«»'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>
                        ·œÌﬂ Õ”«» »«·›⁄·ø <Link to="/login"> ”ÃÌ· «·œŒÊ·</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;