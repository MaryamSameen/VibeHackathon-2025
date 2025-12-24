#include<iostream>
using namespace std;
class queue{
	public:
	int ticket[10];
	string name[10];
	string destination[10];
	int front, rear;
	queue(){
		front=0;
		rear=-1;
	}
	void enqueue(int t, string n, string d){
		rear++;
		ticket[rear]=t;
		name[rear]=n;
		destination[rear]=d;
	}
	
	void dequeue(){
		if(front<=rear){
			front++;
		}
	}
	void display(){
		int count=1;
		for(int i=front;i<=rear;i++){
			cout<<"["<<count<<"]"<<ticket[i]<<"-"<<name[i]<<"-"<<destination[i]<<endl;
			count++;
		}
	}
};
int main(){
	queue q;
	
	q.enqueue(501,"Aisha","dubai");
	q.enqueue(502,"Ahmed","london");
	q.enqueue(503,"Hina","tronto");
	cout<<"original queue:"<<endl;
	q.display();
	q.dequeue();
	cout<<"after one dequeue:"<<endl;
	q.display();
	return 0;
}