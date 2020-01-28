#include <stdio.h>
#include <math.h>


int main (void) {
    
    int numDrinks;
    int maxCapacity;
    

    printf("Enter the number of bottles to be tested: ");
    scanf("%d", &numDrinks);
    printf("Enter the alcohol tolerance of the prisoners: ");
    scanf("%d", &maxCapacity);

    double minPeople = numDrinks;
    for (double k = 0; k < 100; k++) {
        for (double m = 0; m < 100; m++) {
            double maxDrinkable   = pow(k, m);
            double peopleNeeded   = (k - 1) * m;
            double maxDrinkNeeded = pow(k, m - 1) - floor((maxDrinkable - numDrinks) / peopleNeeded);

            if (maxDrinkable >= numDrinks && maxDrinkNeeded < maxCapacity) {
                if (peopleNeeded <= minPeople) {
                    minPeople = peopleNeeded;
                    printf("k: %f, m: %f, people: %f, most drunk: %f\n", k, m, minPeople, maxDrinkNeeded);
                }
            }
        }
    }

    return 0;
}