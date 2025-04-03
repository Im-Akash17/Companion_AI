import { Companion } from "@prisma/client"
import Image from "next/image";
import { Card, CardFooter, CardHeader } from "./ui/card";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface CompanionProps{
    data :( Companion & {
        _count: {
            messages: number;
        }
    })[];

}

export const Companions =({
    data

}:CompanionProps) =>{
    if(data.length === 0){
        return (
            <div className=" flex flex-col items-center justify-center space-y-3 pt-10">
                <div className="relative h-60 w-60">
                    <Image
                        fill
                        className="grayscale"
                        alt = "Empty"
                        src="/empty.png"
                    />
                </div>
                <p className="text-muted-foreground text-sm">No Companions found</p>
                
            </div>
        )
    } 

    return(

        <div className="grid grid-cols-2 gap-2 pb-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.map((item)=>(
                <Card
                    key = {item.id}
                    className="cursor-pointer rounded-xl border-0 bg-primary/10 transition hover:opacity-75"
                >
                    <Link href={`/chat/${item.id}`}>
                        <CardHeader className="flex flex-col items-center justify-center text-center text-muted-foreground">
                            <div className="relative h-32 w-32">
                                <Image
                                    src={item.src}
                                    fill
                                    className="rounded-xl object-cover"
                                    alt="Companion"
                                />
                            
                                         
                            </div>
                           
                            <p className="font-bold mt-1">
                                {item.name}
                            </p>
                            <p className="text-xs">
                                {item.description}
                            </p>
                           
                            

                        </CardHeader>

                        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground mt-3">

                            <p className="lowercase">
                                @{item.userName}
                            </p>

                            <div className="flex items-center">
                                <MessageSquare  className="w-3 h-3 mr-1"/>
                                {item._count.messages}
                            </div>
                        </CardFooter>
                    </Link>
                    
                </Card>

            ))}
        </div>
    )
}