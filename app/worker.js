import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false; 

class PipelineSingleton {
    static task = 'text-generation';
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
            
            // NAYA: Language ke hisaab se Ghost ko instruction dena
            let prompt = "";
            if (event.data.language === 'Hinglish') {
                prompt = `Ghost responds to: "${event.data.text}". Ghost says in short, creepy Hinglish (Hindi written in English letters):`;
            } else {
                prompt = `Ghost responds to: "${event.data.text}". Ghost says in short, creepy English:`;
            }

            let output = await generator(prompt, {
                max_new_tokens: 30,
                temperature: 0.8, 
                do_sample: true,
            });

            let responseText = output[0].generated_text.replace(prompt, '').trim();

            self.postMessage({
                status: 'complete',
                output: responseText || "The spirits are silent..."
            });

        } catch (error) {
            self.postMessage({
                status: 'complete',
                output: "The connection broke... try again."
            });
        }
    }
});