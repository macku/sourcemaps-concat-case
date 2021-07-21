interface BarInterface {
    bark(): string;
}

export default class BarkingBar implements BarInterface {
    bark() {
        return 'bark!';
    }
}