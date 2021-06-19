import * as GameTest from "GameTest";
import { BlockLocation, Items } from "Minecraft";

function poweredRailTest(test, pulseTicks) {
  test.pulseRedstone(new BlockLocation(1, 2, 3), pulseTicks);

  test
    .startSequence()
    .thenIdle(3)
    .thenExecute(() => test.assertItemEntityCountIs(Items.goldenRail, new BlockLocation(1, 2, 1), 1.0, 1)) // powered rail
    .thenSucceed();
}

GameTest.register("DuplicationTests", "powered_rail_twist_bedrock", (test) => {
  poweredRailTest(test, 2);
})
  .structureName("DuplicationTests:powered_rail_twist")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DuplicationTests", "powered_rail_twist", (test) => {
  poweredRailTest(test, 1);
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Single pulse redstone sometimes doesn't activate the piston

GameTest.register("DuplicationTests", "powered_rail_straight_bedrock", (test) => {
  poweredRailTest(test, 2);
})
  .structureName("DuplicationTests:powered_rail_straight")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DuplicationTests", "powered_rail_straight", (test) => {
  poweredRailTest(test, 1);
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Single pulse redstone sometimes doesn't activate the piston

GameTest.register("DuplicationTests", "detector_rail", (test) => {
  test.spawn("minecraft:minecart", new BlockLocation(1, 3, 2));

  test
    .startSequence()
    .thenIdle(3)
    .thenExecute(() => test.assertItemEntityCountIs(Items.detectorRail, new BlockLocation(1, 2, 1), 1.0, 1))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

function railClassicTest(test, pulseTicks) {
  test.pulseRedstone(new BlockLocation(1, 5, 5), pulseTicks);

  test
    .startSequence()
    .thenIdle(3)
    .thenExecute(() => test.assertItemEntityCountIs(Items.rail, new BlockLocation(1, 4, 2), 1.0, 0))
    .thenSucceed();
}

GameTest.register("DuplicationTests", "rail_classic_bedrock", (test) => {
  railClassicTest(test, 2);
})
  .structureName("DuplicationTests:rail_classic")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DuplicationTests", "rail_classic", (test) => {
  railClassicTest(test, 1);
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Single pulse redstone sometimes doesn't activate the piston
