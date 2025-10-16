import React,{userState} from 'react';
import styles from './WorkSpaceSearch.module.css';

const WorkSpaceSearch = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.tatget.value);
    };

    const handleSearchSubmit = () => {
        onSearch(searchTerm);
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    return {
        
    }
}