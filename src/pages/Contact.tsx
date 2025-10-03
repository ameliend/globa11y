import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

const Contact = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Contact</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            For any questions or support regarding accessibility audits, please contact our team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-6 bg-muted rounded-lg">
            <Mail className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold text-lg">Amélien Delahaie</p>
              <a
                href="mailto:amelien.delahaie@canal-plus.com"
                className="text-primary hover:underline"
              >
                amelien.delahaie@canal-plus.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;
