import { Resolver, ObjectType, Field, Query, Arg, ID } from 'type-graphql'

@ObjectType()
class Recipe {
  @Field(type => ID)
  public id: string

  @Field()
  public title: string

  @Field({ nullable: true })
  public description?: string

  @Field()
  public creationDate: Date

  @Field(type => [String])
  public ingredients: string[]
}

@Resolver(of => Recipe)
export class RecipeResolver {
  @Query(returns => Recipe, { nullable: true })
  public async recipe(@Arg('recipeId') recipeId: string): Promise<Recipe> {
    return {
      id: '1',
      title: 'test',
      description: 'test',
      creationDate: new Date(),
      ingredients: ['jest', 'ts']
    }
  }
}
