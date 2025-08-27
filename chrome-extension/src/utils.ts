import { GitHubTool } from './types';
import axios from 'axios';

const BASE_RAW_URL = "https://raw.githubusercontent.com/crackedngineer/iLoveGithub/refs/heads/master/";

export const fetchTools = async () => {
    console.log('Fetching tools from', BASE_RAW_URL + 'tools.json');
    const response = await axios.get(BASE_RAW_URL + 'tools.json')

    if (response.status !== 200) {
        // throw new Error('Failed to fetch tools');
        console.error('Failed to fetch tools, status:', response.status);
        return [];
    }

    return (response.data as any[]).map(item => ({
        name: item.name,
        description: item.description,
        icon: BASE_RAW_URL + item.icon,
        url: item.url,
        color: item.color,
      })) as GitHubTool[];
}