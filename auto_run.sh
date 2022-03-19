#! /bin/bash

today=`date +%y-%m-%d`

echo "----------------------------------------"
echo $today 
echo "블로그 자동화 프로그램을 실행합니다."
echo "ver 0.0.9"
echo "----------------------------------------"
sleep 1 && clear
echo "----------------------------------------"
git status
echo "업데이트 할 내용을 입력 해주십시오."
read comment
clear
echo "당신이 기재한 내용은 아래와 같습니다.
: $today $comment"
echo "해당 내용으로 깃 커밋을 진행합니까? ( (1)Y / (2)n )"
read answer
no=2
if [ $answer -eq $no ] ; then
	echo "블로그 업로드를 취소합니다."
	exit
fi
echo "깃 커밋을 진행합니다." && sleep 1 & clear 
git add .
git commit -m "$today $comment"
echo"----------------------------------------"
sleep 1 && clear
echo"----------------------------------------"
git log -3
echo"----------------------------------------"
sleep 1 && clear
git_push="git push"
echo"$git_push 를 진행합니다."
printf "git push -u origin main.\n"
git push -u origin main
sleep 1 && clear
printf "npm run deploy\n"
npm run deploy
sleep 1 && echo "모든 작업이 마무리 되었습니다."
exit
