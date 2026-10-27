import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false; 

class PipelineSingleton {
    static task = 'text-generation';
    // Humne ek chhota aur fast model laga diya hai jo kisi bhi laptop par second mein chalega (Sirf ~70MB)
    static model = 'Xenova/LaMini-Neo-125M'; 
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    if (event.data.type === 'load') {
        await PipelineSingleton.getInstance(x => {
            self.postMessage(x); 
        });
        self.postMessage({ status: 'ready' }); 
    } 
    else if (event.data.text) {
        try {
            let generator = await PipelineSingleton.getInstance();
            
            // Chote model ke hisaab se simple prompt
            const prompt = `Ghost responds to: "${event.data.text}". Ghost says:`;

            let output = await generator(prompt, {
                max_new_tokens: 30,
                temperature: 0.8, 
                do_sample: true,
            });

            // SAFE EXTRACTION: Taki code kabhi crash na ho
            let responseText = output[0].generated_text.replace(prompt, '').trim();

            self.postMessage({
                status: 'complete',
                output: responseText || "The spirits are silent..."
            });

        } catch (error) {
            // Agar koi error aata hai, toh UI hang nahi hoga, screen par error dikhega
            self.postMessage({
                status: 'complete',
                output: "The connection broke... try again."
            });
        }
    }
});