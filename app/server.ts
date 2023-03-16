import { serve } from 'aleph/server';
import react from 'aleph/plugins/react';

serve({
    port: 3025,
    plugins: [react({ ssr: true })],
});
