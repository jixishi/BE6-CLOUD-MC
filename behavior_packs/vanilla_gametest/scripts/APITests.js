import * as GameTest from "GameTest";
import { BlockLocation, Effects, Items, ItemStack, Location, World } from "Minecraft";

GameTest.register("APITests", "on_entity_created", (test) => {
  World.addEventListener("onEntityCreated", (entity) => {
    if (entity) {
      test.succeed();
    } else {
      test.fail("Expected entity");
    }
  });
  test.spawn("minecraft:horse<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDisabled); // This test will succeed multiple times, need to unregister the listener

GameTest.register("APITests", "assert_is_waterlogged", (test) => {
  const waterChestLoc = new BlockLocation(5, 2, 1);
  const waterLoc = new BlockLocation(4, 2, 1);
  const chestLoc = new BlockLocation(2, 2, 1);
  const airLoc = new BlockLocation(1, 2, 1);

  test.assertIsWaterlogged(waterChestLoc, true);
  test.assertIsWaterlogged(waterLoc, false);
  test.assertIsWaterlogged(chestLoc, false);
  test.assertIsWaterlogged(airLoc, false);
  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_redstone_power", (test) => {
  const redstoneBlockLoc = new BlockLocation(3, 2, 1);
  const redstoneTorchLoc = new BlockLocation(2, 2, 1);
  const poweredLampLoc = new BlockLocation(1, 2, 1);
  const unpoweredLampLoc = new BlockLocation(0, 2, 1);
  const airLoc = new BlockLocation(3, 2, 0);
  const redstoneWireLoc = new BlockLocation(0, 1, 0);

  test.succeedWhen(() => {
    test.assertRedstonePower(redstoneBlockLoc, 15);
    test.assertRedstonePower(redstoneTorchLoc, 15);
    test.assertRedstonePower(poweredLampLoc, 15);
    test.assertRedstonePower(unpoweredLampLoc, 0);
    test.assertRedstonePower(airLoc, -1);
    test.assertRedstonePower(redstoneWireLoc, 13); // 3 length wire
  });
})
  .maxTicks(20)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spawn_item", (test) => {
  const featherItem = new ItemStack(Items.feather, 1, 0);
  test.spawnItem(featherItem, new Location(1.5, 3.5, 1.5));
  test.succeedWhen(() => {
    test.assertEntityPresent("minecraft:item", new BlockLocation(1, 2, 1));
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_data", (test) => {
  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(1, 2, 1);
  test.spawn(pigId, pigLoc);
  test.succeedWhen(() => {
    test.assertEntityData(pigLoc, pigId, (entity) => entity.getName !== undefined);
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "add_effect", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villagerLoc = new BlockLocation(1, 2, 1);
  const villager = test.spawn(villagerId, villagerLoc);
  const duration = 20;
  villager.addEffect(Effects.poison, duration, 1);

  test.assertEntityData(
    villagerLoc,
    villagerId,
    (entity) => entity.getEffect(Effects.poison).getDuration() == duration
  );
  test.assertEntityData(villagerLoc, villagerId, (entity) => entity.getEffect(Effects.poison).getAmplifier() == 1);

  test.runAfterDelay(duration, () => {
    test.assertEntityData(villagerLoc, villagerId, (entity) => entity.getEffect(Effects.poison) === undefined);
    test.succeed();
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_present", (test) => {
  const villagerId = "minecraft:villager_v2";
  const villagerLoc = new BlockLocation(1, 2, 3);
  const emeraldItem = new ItemStack(Items.emerald, 1, 0);
  const emeraldItemLoc = new BlockLocation(3, 2, 3);
  const minecartId = "minecraft:minecart";
  const minecartLoc = new BlockLocation(3, 2, 1);
  const armorStandId = "minecraft:armor_stand";
  const armorStandLoc = new BlockLocation(1, 2, 1);

  test.spawn(villagerId, villagerLoc);
  test.spawnItem(emeraldItem, new Location(3.5, 4.5, 3.5));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerId, villagerLoc);
    test.assertItemEntityPresent(Items.emerald, emeraldItemLoc, 0);
    test.assertEntityPresent(armorStandId, armorStandLoc);

    // Check all blocks surrounding the minecart
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        let offsetLoc = new BlockLocation(minecartLoc.x + x, minecartLoc.y, minecartLoc.z + z);
        if (x == 0 && z == 0) {
          test.assertEntityPresent(minecartId, offsetLoc);
        } else {
          test.assertEntityNotPresent(minecartId, offsetLoc);
        }
      }
    }
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_not_present", (test) => {
  const armorStandId = "minecraft:armor_stand";
  const pigId = "minecraft:pig";
  const armorStandLoc = new BlockLocation(1, 2, 1);
  const airLoc = new BlockLocation(0, 2, 1);

  try {
    test.assertEntityNotPresentInArea(armorStandId);
    test.fail(); // this assert should throw
  } catch (e) {}

  try {
    test.assertEntityNotPresent(armorStandId, armorStandLoc);
    test.fail(); // this assert should throw
  } catch (e) {}

  test.assertEntityNotPresent(armorStandId, airLoc);
  test.assertEntityNotPresentInArea(pigId);

  test.succeed();
})
  .structureName("APITests:armor_stand")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_item_entity_count_is", (test) => {
  let oneItemLoc = new BlockLocation(3, 2, 1);
  let fiveItemsLoc = new BlockLocation(1, 2, 1);
  let noItemsLoc = new BlockLocation(2, 2, 1);
  let diamondPickaxeLoc = new BlockLocation(2, 2, 4);

  const oneEmerald = new ItemStack(Items.emerald, 1, 0);
  const onePickaxe = new ItemStack(Items.diamondPickaxe, 1, 0);
  const fiveEmeralds = new ItemStack(Items.emerald, 5, 0);

  test.spawnItem(oneEmerald, new Location(3.5, 3, 1.5));
  test.spawnItem(fiveEmeralds, new Location(1.5, 3, 1.5));

  // spawn 9 pickaxes in a 3x3 grid
  for (let x = 1.5; x <= 3.5; x++) {
    for (let z = 3.5; z <= 5.5; z++) {
      test.spawnItem(onePickaxe, new Location(x, 3, z));
    }
  }

  test.assertItemEntityCountIs(Items.emerald, noItemsLoc, 0, 0);

  test.succeedWhen(() => {
    test.assertItemEntityCountIs(Items.feather, oneItemLoc, 0, 0);
    test.assertItemEntityCountIs(Items.emerald, oneItemLoc, 0, 1);
    test.assertItemEntityCountIs(Items.feather, fiveItemsLoc, 0, 0);
    test.assertItemEntityCountIs(Items.emerald, fiveItemsLoc, 0, 5);
    test.assertItemEntityCountIs(Items.emerald, fiveItemsLoc, 0, 5);
    test.assertItemEntityCountIs(Items.diamondPickaxe, diamondPickaxeLoc, 1, 9);
    test.assertItemEntityCountIs(Items.diamondPickaxe, diamondPickaxeLoc, 0, 1);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_touching", (test) => {
  const armorStandId = "minecraft:armor_stand";

  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 1.5));
  test.assertEntityTouching(armorStandId, new Location(1.5, 3.5, 1.5));
  test.assertEntityNotTouching(armorStandId, new Location(1.0, 2.5, 1.5));
  test.assertEntityNotTouching(armorStandId, new Location(2.0, 2.5, 1.5));
  test.assertEntityNotTouching(armorStandId, new Location(1.5, 2.5, 1.0));
  test.assertEntityNotTouching(armorStandId, new Location(1.5, 2.5, 2.0));

  test.succeed();
})
  .structureName("APITests:armor_stand")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "pulse_redstone", (test) => {
  const pulseLoc = new BlockLocation(1, 2, 2);
  const lampLoc = new BlockLocation(1, 2, 1);
  test.assertRedstonePower(lampLoc, 0);
  test.pulseRedstone(pulseLoc, 2);

  test
    .startSequence()
    .thenIdle(2)
    .thenExecute(() => test.assertRedstonePower(lampLoc, 15))
    .thenIdle(1)
    .thenExecute(() => test.assertRedstonePower(lampLoc, 0))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "location", (test) => {
  let testLoc = new BlockLocation(1, 1, 1);
  let worldLoc = test.worldLocation(testLoc);
  let relativeLoc = test.relativeLocation(worldLoc);
  test.assert(!relativeLoc.equals(worldLoc), "Expected relativeLoc and worldLoc to be different");
  test.assert(relativeLoc.equals(testLoc), "Expected relativeLoc to match testLoc");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);
