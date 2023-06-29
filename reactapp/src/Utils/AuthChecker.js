import axios from 'axios';
import { CheckAuthUrl } from '../Links';

export const checkIfUserIsAuthenticated = () => {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem('accessToken');
        axios
            .get(CheckAuthUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                console.log(response.status);
                if (response.status === 200 || response.status === 201) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch((error) => {
                console.error(error);
                resolve(false);
            });
    });
};