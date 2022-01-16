import { Logger } from "tsrpc";

export let myLogger: Logger = {
    debug: function (...args: any[]): void {
        console.log(...args);
    },
    log: function (...args: any[]): void {
        // console.log(...args);
    },
    warn: function (...args: any[]): void {
        console.log(...args);
    },
    error: function (...args: any[]): void {
        console.log(...args);
    }
}


