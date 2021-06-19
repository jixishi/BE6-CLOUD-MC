import * as GameTest from "GameTest";
import GameTestExtensions from "./GameTestExtensions.js";
import { BlockLocation } from "Minecraft";

GameTest.register("ExtensionTests", "add_entity_in_boat", (test) => {
  const testEx = new GameTestExtensions(test);
  testEx.addEntityInBoat("sheep", new BlockLocation(1, 2, 1));
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ExtensionTests", "make_about_to_drown", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villager = test.spawn(villagerId, new BlockLocation(2, 2, 2));

  testEx.makeAboutToDrown(villager);

  test.succeedWhen(() => {
    test.assertEntityNotPresentInArea(villagerId);
  });
})
  .structureName("ComponentTests:aquarium")
  .maxTicks(20)
  .tag(GameTest.Tags.suiteDefault);
