import { SatToUnitPipe } from "./sat-to-unit/sat-to-unit.pipe";
import { SatToFiatPipe } from "./sat-to-fiat/sat-to-fiat.pipe";
import { FiatToUnitPipe } from "./fiat-to-unit/fiat-to-unit.pipe";

export const PIPES = [SatToFiatPipe, SatToUnitPipe, FiatToUnitPipe];
