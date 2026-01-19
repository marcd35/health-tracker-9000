'use client';

import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddItemDialogProps {
    title: string;
    description: string;
    items: string[];
    existingItems: string[];
    onAdd: (item: string) => void;
    triggerLabel: string;
}

export function AddItemDialog({
    title,
    description,
    items,
    existingItems,
    onAdd,
    triggerLabel,
}: AddItemDialogProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const filteredItems = items.filter(
        (item) => !existingItems.includes(item) && item.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleSelect = (value: string) => {
        onAdd(value);
        setOpen(false);
        setInputValue('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border-dashed gap-1 h-7 px-3">
                    <Plus className="h-3 w-3" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Command className="border rounded-md">
                    <CommandInput
                        placeholder="Search or type custom..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty className="py-2 px-4 text-sm">
                            {inputValue ? (
                                <button
                                    className="w-full text-left text-primary hover:underline"
                                    onClick={() => handleSelect(inputValue)}
                                >
                                    Create "{inputValue}"
                                </button>
                            ) : (
                                'No results found.'
                            )}
                        </CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            {filteredItems.map((item) => (
                                <CommandItem
                                    key={item}
                                    value={item}
                                    onSelect={() => handleSelect(item)}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            existingItems.includes(item) ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {item}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
