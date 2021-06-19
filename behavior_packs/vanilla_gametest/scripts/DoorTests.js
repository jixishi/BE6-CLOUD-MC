import * as GameTest from "GameTest";
import { BlockLocation } from "Minecraft";

const DOOR_TEST_PADDING = 100; // The padding for the door tests will need to be increased some more to prevent the interference

GameTest.register("DoorTests", "four_villagers_one_door", (test) => {
  const villagerEntityType = "minecraft:villager_v2";
  const villagerEntitySpawnType =
    "minecraft:villager_v2<minecraft:spawn_farmer>"; // Attempt to spawn the villagers as farmers

  test.spawn(villagerEntitySpawnType, new BlockLocation(5, 2, 4));
  test.spawn(villagerEntitySpawnType, new BlockLocation(4, 2, 5));
  test.spawn(villagerEntitySpawnType, new BlockLocation(2, 2, 5));
  test.spawn(villagerEntitySpawnType, new BlockLocation(1, 2, 4));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerEntityType, new BlockLocation(5, 2, 2));
    test.assertEntityPresent(villagerEntityType, new BlockLocation(5, 2, 1));
    test.assertEntityPresent(villagerEntityType, new BlockLocation(1, 2, 2));
    test.assertEntityPresent(villagerEntityType, new BlockLocation(1, 2, 1));
  });
})
  .tag(GameTest.Tags.suiteDisabled) // Villagers can get stuck on the door or on sleeping villagers
  .padding(DOOR_TEST_PADDING) // Space out villager tests to stop them from confusing each other
  .batch("night") // This should be a constant at some point
  .maxTicks(600);  

GameTest.register("DoorTests", "villagers_can_pass_open_iron_door", (test) => {
	const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";
	
	test.spawn(villagerActor, new BlockLocation(2, 2, 5));
	
	test.succeedWhenEntityPresent(villagerActor, new BlockLocation(1, 2, 1));
})
	.maxTicks(900)   //Increase max ticks from 200 to 900 (same value as in PathFindingTests), to make sure villager can find and go to bed  
	.batch("night")
	.required(false)
	.padding(DOOR_TEST_PADDING)
	.tag(GameTest.Tags.suiteDefault);
	
GameTest.register("DoorTests", "villagers_cant_pass_closed_iron_door", (test) =>{
	const villagerActor ="minecraft:villager_v2<minecraft:spawn_farmer>"
	
	test.spawn(villagerActor, new BlockLocation(2, 2, 5));
	
	test.startSequence()
	.thenExecute(() =>{test.assertEntityNotPresent(villagerActor,new BlockLocation(1, 2, 1));})
	.thenIdle(200) 
	.thenSucceed()
})
	.maxTicks(220)
	.padding(DOOR_TEST_PADDING)
	.batch("night")
	.required(false)
	.tag(GameTest.Tags.suiteDefault);

GameTest.register("DoorTests", "door_maze", (test) => {
	const villagerActor = "minecraft:villager_v2";

	test.spawn(villagerActor, new BlockLocation(1, 2, 1));

	test.succeedWhenEntityPresent(villagerActor, new BlockLocation(7, 2, 7));
})
	.maxTicks(400)
	.padding(DOOR_TEST_PADDING)
	.batch("night")
	.required(false)
	.tag(GameTest.Tags.suiteDisabled); // Both of Java and Bedrock are failed villager is stuck and doesn't find the good way.

GameTest.register("DoorTests", "door_maze_3d", (test) => {
	const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

	test.spawn(villagerActor, new BlockLocation(1, 2, 1));

	test.succeedWhenEntityPresent(villagerActor, new BlockLocation(7, 2, 7));
})
	.maxTicks(400)
	.padding(DOOR_TEST_PADDING)
	.batch("night")
	.required(false)
	.tag(GameTest.Tags.suiteDisabled);  //Both of Java and Bedrock are failed looks like he doesn't cross obstacle and doesn't find the good way.

GameTest.register("DoorTests", "door_maze_crowded", (test) => {
	const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

	test.spawn(villagerActor, new BlockLocation(1, 2, 1));
	test.spawn(villagerActor, new BlockLocation(3, 2, 2));
	test.spawn(villagerActor, new BlockLocation(5, 2, 1));
	test.spawn(villagerActor, new BlockLocation(1, 2, 1));

	test.succeedWhen(() => {
		test.assertEntityPresent(villagerActor, new BlockLocation(7, 2, 7));
		test.assertEntityPresent(villagerActor, new BlockLocation(4, 2, 8));
		test.assertEntityPresent(villagerActor, new BlockLocation(2, 2, 7));
		test.assertEntityPresent(villagerActor, new BlockLocation(1, 2, 8));
	});
})
	.maxTicks(400)
	.padding(DOOR_TEST_PADDING)
	.batch("night")
	.required(false)
	.tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed, some villiages are stuck behind the door and doesn't find the path.
	
GameTest.register("DoorTests", "inverted_door", (test) => {
	const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";
	
	test.spawn(villagerActor, new BlockLocation(3, 2, 1));
	
	test.succeedWhenEntityPresent(villagerActor, new BlockLocation(3, 2, 5));
})
	.maxTicks(200)
	.padding(DOOR_TEST_PADDING)
	.batch("night")
	.required(false)
	.tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed, village is stuck behind the door, at there all time.
