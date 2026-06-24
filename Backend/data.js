const fs=require('fs/promises')

async function ReadData() {
    try {
        const rawdata = await fs.readFile('../generated-data.json','utf8')
        const data = JSON.parse(rawdata)
        console.log('data extracted');
        return data;
    } catch (error) {
        return 'error';
        
    }
}
module.exports = ReadData;