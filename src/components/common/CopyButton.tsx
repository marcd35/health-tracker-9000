'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CopyButtonProps {
    value: string;
    className?: string;
    variant?: 'ghost' | 'outline' | 'default';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function CopyButton({
    value,
    className,
    variant = 'ghost',
    size = 'icon'
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            toast.error('Failed to copy to clipboard');
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                copied ? "text-green-500 bg-green-500/10" : "text-muted-foreground hover:text-foreground",
                className
            )}
            onClick={copyToClipboard}
            title="Copy to clipboard"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5" />
            ) : (
                <Copy className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">Copy</span>
        </Button>
    );
}
