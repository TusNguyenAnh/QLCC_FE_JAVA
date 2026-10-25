"use client";
import {useEffect, useState} from "react";

import {Button} from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {CheckIcon, ChevronsUpDownIcon} from "lucide-react";

import {cn} from "@/lib/utils";

type ComboboxItem = {
    label: string; // ten item
    value: string; // id cua item
};

type ComboboxProps = {
    items: ComboboxItem[];
    onChange: (value: string) => void;
    onValueChange?: (value: string) => void;
    itemUpdate: string; // id cua item update
};


export function Combobox({items, onChange, onValueChange, itemUpdate}: ComboboxProps) {
    const [openCommandList, setOpenCommandList] = useState(false);
    const [value, setValue] = useState(""); // gia tri phan tu duoc chon trong combobox

    useEffect(() => {
        setValue(itemUpdate);
    }, [itemUpdate]);

    return (
        <Popover open={openCommandList} onOpenChange={setOpenCommandList}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                >
                    {value != "" && value != null && value != "null"
                        ? items.find((item) => item.value === value)?.label
                        : "Select item..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-max p-0 transform: translate(826px, 402px) z-[1000] pointer-events-auto"
                onWheel={(e) => {
                    e.stopPropagation();
                }}
            >
                <Command>
                    <CommandInput className="min-w-1/2" placeholder="Search item..."
                                  onValueChange={onValueChange}
                    />
                    <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                            {/*gia tri default*/}
                            <CommandItem
                                key="not_parent" // id
                                value="null" //name
                                onSelect={(currentValue) => {
                                    setValue(currentValue);
                                    setOpenCommandList(false);
                                    onChange("null");
                                }}
                            >
                                <CheckIcon
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value == "null" ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                Không thuộc
                            </CommandItem>

                            {items.map((item) => (
                                <CommandItem
                                    key={item.value} // id
                                    value={item.label} //name
                                    onSelect={() => {
                                        // console.log(currentValue, value);
                                        setValue(item.value);
                                        setOpenCommandList(false);
                                        onChange(item.value);
                                    }}
                                >
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
