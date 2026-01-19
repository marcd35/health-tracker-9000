'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '../common/CopyButton';

interface FoodInspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    foodName: string;
    rawJson: any;
}

export function FoodInspectionModal({
    isOpen,
    onClose,
    foodName,
    rawJson,
}: FoodInspectionModalProps) {
    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawJson, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `usda-${foodName.toLowerCase().replace(/\s+/g, '-')}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none bg-background/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Data Inspection
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1">
                                Reviewing raw USDA data for <span className="font-semibold text-foreground">{foodName}</span>
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="gap-2 h-9 px-4 rounded-full border-muted-foreground/20 hover:bg-muted/50 transition-all"
                            >
                                <Download className="h-4 w-4" />
                                Export JSON
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-6 pt-2 space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                            <strong>Allergen Warning:</strong> USDA does not provide allergen information. Always review ingredients and verify allergen status before logging.
                        </p>
                    </div>

                    <div className="relative group rounded-xl border border-muted-foreground/10 bg-muted/30 overflow-hidden flex flex-col h-[50vh]">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-muted-foreground/10 bg-muted/50">
                            <Badge variant="outline" className="text-[10px] font-mono tracking-widest uppercase opacity-70">
                                RAW_USDA_RESPONSE.JSON
                            </Badge>
                            <CopyButton value={JSON.stringify(rawJson, null, 2)} />
                        </div>
                        <ScrollArea className="flex-1 font-mono text-xs">
                            <pre className="p-4 leading-relaxed">
                                {JSON.stringify(rawJson, null, 2)}
                            </pre>
                        </ScrollArea>
                    </div>
                </div>

                <div className="p-6 border-t border-muted-foreground/10 bg-muted/20 flex justify-end">
                    <Button
                        onClick={onClose}
                        variant="default"
                        className="rounded-full px-8 h-10 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                    >
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
